#!/usr/bin/env python3
"""그로스 트리 스냅샷 — 그로스 대시보드(claude.ai 아티팩트 「지름알림 그로스 트리」)가 읽는 주간 JSON 네 개.

지표 트리(jirum vault domain/service-key-metrics.md)의 두 축을 같은 주 단위로 맞춰 뽑는다.
- money.json   돈의 식: 주간 수익(제휴처별) — 운영 MySQL affiliate_sales·ad_revenue_daily
- traffic.json 구매클릭·웹 활성·채널별 활성 — GA4(한국만, 사용자 지표는 봇게이트 desktop∧Windows 제외)
- loop.json    북극성(알림 경유 재방문)과 그 앞단 — GA4 + 운영 MySQL + 카톡방 counts.csv. funnel-weekly.py 와 같은 정의
- experiments.json 실험 등록부(crawling-server src/experiment/experiment-registry.ts)
- linkmix.json  구매클릭(서버 purchase_link_click, W40~)을 상품의 지금 수익링크 제휴사로 나눈 주간 수 — Mongo + MySQL product
- nolink_source.json 마지막 완료 주 구매클릭을 딜 출처별로 — 그중 링크 없는 클릭 수·비율
- list_ctr.json 웹 카드 출처별 최근 7일 화면 노출(post_impression)·출처 붙은 상세 진입(post_view)
- formula.json 성장 공식(jirum vault domain/growth-loop-formula.md)의 주간 입력 — 검색 신규·검색 구매클릭·카톡 신규·카톡 구매클릭·새 딜 페이지

수동: python3 scripts/growth-snapshot.py [주 수=16]  → ~/.local/share/jirum/growth/*.json
대시보드 https://claude.ai/artifact/QajT8bE1EooG2jHKeujbCj 반영은 Orca 정기 자동화(Claude 세션)가 이 파일들을 올린다
— launchd 는 아티팩트에 못 올린다. 설치: install -m 0755 scripts/growth-snapshot.py ~/.local/bin/
"""
import base64
import datetime as dt
import json
import os
import subprocess
import sys
import tempfile
import time
import urllib.parse
import urllib.request

import google.auth.transport.requests
from google.oauth2 import service_account


def _notify_failure(kind, exc, tb):
    """launchd 는 실패해도 조용하다(성공 알림만 있었다) — 죽으면 macOS 알림으로 알린다. traceback 은 그대로 로그로."""
    sys.__excepthook__(kind, exc, tb)
    msg = f"{os.path.basename(__file__)}: {kind.__name__}: {exc}"[:200].replace("\"", "'").replace("\\", "/")
    subprocess.run(["osascript", "-e", f"display notification \"{msg}\" with title \"지름알림 지표 작업 실패\" sound name \"Basso\""],
                   check=False)


sys.excepthook = _notify_failure

WEEKS = int(sys.argv[1]) if len(sys.argv) > 1 else 16
PROPERTY = "properties/394356262"
SA = os.path.expanduser("~/.config/jirum/gtm-sa.json")
OUT = os.path.expanduser("~/.local/share/jirum/growth")
KUBE = ["kubectl", "--context", "prod", "-n", "crawling-server"]
CRAWLING = os.path.expanduser("~/Documents/github/jirum-alarm/jirum-alarm-crawling-server")

PROMPT_CLICKS = ["okachat_prompt_click", "keyword_prompt_click", "click_btn_add_notification_keyword",
                 "app_download_click", "click_banner_kakaotalk", "push_channel_sheet_click"]
PUSH_OPENS = ["notification_open", "notification_clicked"]  # 앱 notification_clicked 는 푸시+알림함, 웹은 알림함 — 둘 다 «알림 경유»

today = dt.date.today()
last_sun = today - dt.timedelta(days=today.isoweekday() % 7 or 7)
start = last_sun - dt.timedelta(days=7 * WEEKS - 1)
mondays = [start + dt.timedelta(days=7 * i) for i in range(WEEKS)]
keys = [f"{d.isocalendar()[0]}{d.isocalendar()[1]:02d}" for d in mondays]


def label(k):
    return f"{k[:4]}-W{k[4:]}"


def ga4():
    cred = service_account.Credentials.from_service_account_file(
        SA, scopes=["https://www.googleapis.com/auth/analytics.readonly"])
    cred.refresh(google.auth.transport.requests.Request())
    kr = {"filter": {"fieldName": "country", "stringFilter": {"value": "South Korea"}}}
    bot = {"notExpression": {"andGroup": {"expressions": [
        {"filter": {"fieldName": "deviceCategory", "stringFilter": {"value": "desktop"}}},
        {"filter": {"fieldName": "operatingSystem", "stringFilter": {"value": "Windows"}}}]}}}
    web = {"filter": {"fieldName": "platform", "stringFilter": {"value": "web"}}}
    app = {"filter": {"fieldName": "platform", "inListFilter": {"values": ["iOS", "Android"]}}}
    ev = lambda names: {"filter": {"fieldName": "eventName", "inListFilter": {"values": names}}}
    src = lambda f, v: {"filter": {"fieldName": f, "stringFilter": {"value": v}}}
    APP_DETAIL = {"andGroup": {"expressions": [ev(["screen_view"]), src("unifiedScreenName", "ProductDetail")]}}
    KAKAO = {"andGroup": {"expressions": [src("sessionSource", "kakao"), src("sessionMedium", "notification")]}}
    # 앱은 이벤트로, 웹 푸시는 이벤트가 안 남아(백그라운드 알림은 SDK 가 직접 연다) 랜딩 utm_source=notification 으로 잡는다.
    PUSH = {"orGroup": {"expressions": [ev(PUSH_OPENS), src("sessionSource", "notification")]}}

    def q(metric, flt, split=None):
        dims = [{"name": "isoYearIsoWeek"}] + ([{"name": split}] if split else [])
        body = {"dateRanges": [{"startDate": str(start), "endDate": str(last_sun)}],
                "dimensions": dims, "metrics": [{"name": metric}], "limit": 5000,
                "dimensionFilter": {"andGroup": {"expressions": [kr, *flt]}}}
        req = urllib.request.Request(
            f"https://analyticsdata.googleapis.com/v1beta/{PROPERTY}:runReport", data=json.dumps(body).encode(),
            headers={"Authorization": "Bearer " + cred.token, "Content-Type": "application/json"})
        out = {}
        for r in json.load(urllib.request.urlopen(req, timeout=60)).get("rows", []):
            d = [v["value"] for v in r["dimensionValues"]]
            n = int(r["metricValues"][0]["value"])
            if split:
                out.setdefault(d[0], {})[d[1]] = n
            else:
                out[d[0]] = n
        return out

    return {
        # 분자(클릭)·분모(활성) 모두 같은 봇게이트 — 한쪽만 걸면 «1명당 클릭»이 부푼다.
        "buy_clicks": q("eventCount", [web, bot, ev(["click_btn_buy"])]),
        "buy_users": q("totalUsers", [web, bot, ev(["click_btn_buy"])]),
        "web_users": q("activeUsers", [web, bot]),
        "channel": q("activeUsers", [web, bot], "sessionDefaultChannelGroup"),
        # 상세 조회는 웹 view_item + 앱 ProductDetail 화면(앱은 view_item 을 안 쏜다 — 빼면 앱 사용자가 통째로 빠진다).
        "detail": q("totalUsers", [{"orGroup": {"expressions": [ev(["view_item"]), APP_DETAIL]}}]),
        "prompt": q("totalUsers", [ev(PROMPT_CLICKS)]),
        # 북극성 세 칸은 전부 totalUsers — activeUsers 와 섞어 더하면 단위가 어긋난다.
        "kakao": q("totalUsers", [KAKAO]),
        "pushopen": q("totalUsers", [PUSH]),
        # 북극성 = 한 사람이 카톡·푸시를 둘 다 타도 한 번만 세는 합집합(따로 센 값을 더하지 않는다).
        "notified": q("totalUsers", [{"orGroup": {"expressions": [KAKAO, PUSH]}}]),
        "app_active": q("activeUsers", [app]),
        # 성장 공식 입력. 채널은 traffic 의 channel 과 같은 sessionDefaultChannelGroup(Organic Search = 검색).
        "new_by_ch": q("newUsers", [web, bot], "sessionDefaultChannelGroup"),
        "buy_by_ch": q("eventCount", [web, bot, ev(["click_btn_buy"])], "sessionDefaultChannelGroup"),
        # 카톡 신규 = 카톡방 링크로 처음 잡힌 사람. 카톡 인앱 브라우저 쿠키가 바뀌면 기존 사람도 신규로 잡혀 이탈과 함께 부푼다.
        "kakao_new": q("newUsers", [KAKAO]),
        "kakao_clicks": q("eventCount", [KAKAO, ev(["click_btn_buy"])]),
    }


# 앱 파드가 아니라 mysql-0 에서 읽는다 — 앱 파드는 배포마다 교체돼 긴 exec 가 137 로 끊긴다(2026-10-13).
OK = "(status IS NULL OR status<>'cancelled')"
DB_SQL = {
    "sales": f"""SELECT /*+ MAX_EXECUTION_TIME(15000) */ CAST(YEARWEEK(purchasedAt,3) AS CHAR) wk, provider,
  SUM(localCommission) gross FROM affiliate_sales WHERE purchasedAt>='{{s}}' AND purchasedAt<'{{e}}' AND {OK} GROUP BY wk, provider""",
    "ad": """SELECT CAST(YEARWEEK(date,3) AS CHAR) wk, SUM(revenue) gross FROM ad_revenue_daily
  WHERE date>='{s}' AND date<'{e}' GROUP BY wk""",
    "guest": """SELECT CAST(YEARWEEK(u.createdAt,3) AS CHAR) wk, COUNT(*) guest,
  SUM(EXISTS(SELECT 1 FROM user_token t WHERE t.userId=u.id AND t.deletedAt IS NULL)) gtok
  FROM user u WHERE u.isGuest=1 AND u.createdAt>='{s}' AND u.createdAt<'{e}'
   AND (EXISTS(SELECT 1 FROM notification_keyword k WHERE k.userId=u.id) OR EXISTS(SELECT 1 FROM user_notification_theme n WHERE n.userId=u.id))
  GROUP BY wk""",
    # user.id<=1682 는 2026-07-27 createdAt 일괄 백필로 가입 시각이 오염됐다.
    "signup": """SELECT CAST(YEARWEEK(u.createdAt,3) AS CHAR) wk, COUNT(*) signup,
  SUM(EXISTS(SELECT 1 FROM user_token t WHERE t.userId=u.id AND t.deletedAt IS NULL)) tok
  FROM user u WHERE u.id>1682 AND u.isGuest=0 AND u.createdAt>='{s}' AND u.createdAt<'{e}' GROUP BY wk""",
    # 새 딜 페이지(상품 상세) — 검색 입구 재고가 느는 속도. provider.type 은 community·mall.
    "pages": """SELECT /*+ MAX_EXECUTION_TIME(60000) */ CAST(YEARWEEK(p.createdAt,3) AS CHAR) wk, pr.type, COUNT(*) n
  FROM product p JOIN provider pr ON pr.id=p.providerId WHERE p.createdAt>='{s}' AND p.createdAt<'{e}' GROUP BY wk, pr.type""",
    "recv": """SELECT CAST(YEARWEEK(createdAt,3) AS CHAR) wk, COUNT(DISTINCT userId) recv
  FROM push_history WHERE userId IS NOT NULL AND errorCode IS NULL AND createdAt>='{s}' AND createdAt<'{e}' GROUP BY wk""",
}


def db():
    end = last_sun + dt.timedelta(days=1)
    out = {}
    for name, sql in DB_SQL.items():
        sql = sql.format(s=start, e=end).replace("\n", " ")
        tsv = subprocess.check_output(KUBE + ["exec", "mysql-0", "--", "bash", "-c",
                                              'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -D crawling -B -e "$0" 2>/dev/null', sql],
                                      text=True, timeout=120).splitlines()
        cols = tsv[0].split("\t") if tsv else []
        out[name] = [dict(zip(cols, line.split("\t"))) for line in tsv[1:]]
    return out


def room():
    """핫딜 온리방 인원 측정값(하루 2회, 2026-10-12~). 못 읽으면 빈 목록."""
    try:
        rows = subprocess.check_output(["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", "user@192.168.99.71",
                                        "cat ~/jirum-kakao-room/counts.csv"], text=True, timeout=30).splitlines()[1:]
    except Exception:
        return []
    readings = []
    for row in rows:
        at, name, members = (row.split(",") + ["", "", ""])[:3]
        if name == "핫딜 온리방" and members.isdigit():
            readings.append({"at": at[:16].replace("T", " "), "members": int(members)})
    return readings


def room_flow():
    """핫딜 온리방 10분 표본(2026-10-16~, scripts/kakao-room/record-10m.sh)으로 주별 입장·퇴장 하한을 센다.
    이웃 표본이 20분 안이면 늘어난 수 = 입장, 줄어든 수 = 퇴장(같은 10분에 겹치면 덜 센다). 간격이 더 벌어진 구간
    (맥북이 잠든 동안)은 순증만 알 수 있어 세지 않고, 대신 그 주에 표본으로 덮은 시간(cover_h)을 같이 남긴다."""
    try:
        rows = subprocess.check_output(["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", "user@192.168.99.71",
                                        "cat ~/jirum-kakao-room/counts-10m.csv"], text=True, timeout=60).splitlines()[1:]
    except Exception:
        return {}
    pts = []
    for row in rows:
        at, name, members = (row.split(",") + ["", "", ""])[:3]
        if name == "핫딜 온리방" and members.isdigit():
            pts.append((dt.datetime.strptime(at, "%Y-%m-%dT%H:%M:%S%z"), int(members)))
    pts.sort()
    out = {}
    for (t0, m0), (t1, m1) in zip(pts, pts[1:]):
        iso = t1.date().isocalendar()
        w = out.setdefault(f"{iso[0]}{iso[1]:02d}", {"joins": 0, "leaves": 0, "cover_h": 0.0, "members": m1})
        w["members"] = m1
        gap = (t1 - t0).total_seconds()
        if gap <= 20 * 60:
            w["joins"] += max(0, m1 - m0)
            w["leaves"] += max(0, m0 - m1)
            w["cover_h"] += gap / 3600
    for w in out.values():
        w["cover_h"] = round(w["cover_h"], 1)
    return out


EXP_JS = r"""
const { EXPERIMENTS } = require('./src/experiment/experiment-registry');
console.log(JSON.stringify(EXPERIMENTS.map(e => ({ id: e.id, kind: e.kind, status: e.status, lever: e.lever ?? '', title: e.title,
  question: e.question, primaryMetric: e.primaryMetric, startedAt: e.startedAt ?? '', checkAt: e.checkAt ?? '',
  endedAt: e.endedAt ?? '', results: e.results.length,
  lastDecision: [...e.results].reverse().find(r => r.decision)?.decision ?? '' }))));
"""


def experiments():
    # 작업 사본은 다른 세션이 쓰고 있으니 건드리지 않는다 — origin/main 의 src 만 임시 폴더로 꺼내 읽는다.
    subprocess.run(["git", "-C", CRAWLING, "fetch", "-q", "origin", "main"], check=False, capture_output=True)
    with tempfile.TemporaryDirectory() as tmp:
        archive = subprocess.run(["git", "-C", CRAWLING, "archive", "origin/main", "src", "tsconfig.json"],
                                 check=True, capture_output=True).stdout
        subprocess.run(["tar", "-x", "-C", tmp], input=archive, check=True)
        env = {**os.environ, "NODE_PATH": os.path.join(CRAWLING, "node_modules"),
               "NODE_CONFIG_DIR": os.path.join(CRAWLING, "config"), "SUPPRESS_NO_CONFIG_WARNING": "1"}
        out = subprocess.check_output([os.path.join(CRAWLING, "node_modules/.bin/ts-node"), "-T", "-e", EXP_JS],
                                      cwd=tmp, env=env, text=True)
    rows = json.loads(out)
    for r in rows:
        live = bool(r["checkAt"]) and r["status"] in ("RUNNING", "PLANNED")
        days = (dt.date.fromisoformat(r["checkAt"]) - today).days if live else None
        r["days_left"] = days
        r["due"] = "" if days is None else "overdue" if days < 0 else "this_week" if days <= 7 else "later"
    return rows


# 웹 카드 출처(frontend card-tracking.ts). home_hotdeal·random_ranking 은 서버가 목록을 내준 기록이라 화면 노출이 아니다.
CARD_SOURCES = ["home_ranking", "home_promotion", "search", "search_recommend", "ranking_tab", "trending_live",
                "trending_recommend", "wishlist", "related", "keyword_recommend", "together_viewed",
                "category_popular", "notification_theme", "expired_latest"]
# 서버측 구매클릭(purchase_link_click)은 2026-09-27 부터 — 그 주 W39 는 이틀뿐이라 W40 부터 쓴다.
CLICKS_SINCE = "202640"
MONGO_PORT = 27118

MONGO_JS = r"""
const { MongoClient } = require(process.env.MONGO_DRIVER);
(async () => {
  const c = new MongoClient(process.env.MONGO_URI); await c.connect();
  const h = c.db('jirum-alarm').collection('user_history');
  const [since, sources] = [new Date(process.argv[1]), JSON.parse(process.argv[2])];
  const wk = { $concat: [{ $toString: { $isoWeekYear: { date: '$createdAt', timezone: 'Asia/Seoul' } } },
    { $cond: [{ $lt: [{ $isoWeek: { date: '$createdAt', timezone: 'Asia/Seoul' } }, 10] }, '0', ''] },
    { $toString: { $isoWeek: { date: '$createdAt', timezone: 'Asia/Seoul' } } }] };
  const clicks = await h.aggregate([
    { $match: { target: 'purchase_link_click', createdAt: { $gte: since } } },
    { $group: { _id: { wk, pid: '$targetId' }, n: { $sum: 1 } } }], { maxTimeMS: 600000 }).toArray();
  const d7 = new Date(Date.now() - 7 * 864e5);
  const lists = await h.aggregate([
    { $match: { target: { $in: ['post_impression', 'post_view'] }, source: { $in: sources }, createdAt: { $gte: d7 } } },
    { $group: { _id: { t: '$target', s: '$source' }, n: { $sum: 1 } } }], { maxTimeMS: 600000 }).toArray();
  console.log(JSON.stringify({ clicks: clicks.map((r) => [r._id.wk, String(r._id.pid), r.n]),
    lists: lists.map((r) => [r._id.t, r._id.s, r.n]), d7 }));
  await c.close();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
"""


def mongo_root_password():
    """root 비번은 코드에 두지 않고 매번 운영 시크릿(mongodb/mongodb)에서 읽는다 — 이 레포는 공개다."""
    b64 = subprocess.check_output(["kubectl", "--context", "prod", "-n", "mongodb", "get", "secret", "mongodb",
                                   "-o", "jsonpath={.data.mongodb-root-password}"], text=True, timeout=30)
    return urllib.parse.quote(base64.b64decode(b64).decode(), safe="")


def mongo():
    """구매클릭(주×상품)과 웹 카드 출처별 최근 7일 노출·진입. 맥에서 Mongo 직접 접속이 안 돼 port-forward 로 붙는다."""
    pf = subprocess.Popen(["kubectl", "--context", "prod", "-n", "mongodb", "port-forward", "pod/mongodb-0",
                           f"{MONGO_PORT}:27017"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        time.sleep(3)
        env = {**os.environ, "MONGO_DRIVER": os.path.join(CRAWLING, "node_modules/mongodb"),
               "MONGO_URI": f"mongodb://root:{mongo_root_password()}@localhost:{MONGO_PORT}/jirum-alarm?authSource=admin"
                            "&readPreference=secondaryPreferred&directConnection=true"}
        return json.loads(subprocess.check_output(["node", "-e", MONGO_JS, f"{start}T00:00:00+09:00",
                                                   json.dumps(CARD_SOURCES)], env=env, text=True, timeout=600))
    finally:
        pf.terminate()


def link_of(pids):
    """상품별 (지금의 수익링크 제휴사, 출처) — 링크가 비었으면 none. 클릭 시점이 아니라 지금 상태다."""
    if not pids:
        return {}
    sql = ("SELECT p.id, IF(p.profitLink IS NULL OR p.profitLink='', 'none', COALESCE(p.profitLinkProvider, 'other')), "
           "COALESCE(pr.nameKr, pr.name, '?') FROM product p LEFT JOIN provider pr ON pr.id = p.providerId "
           f"WHERE p.id IN ({','.join(p for p in pids if p.isdigit())})")
    tsv = subprocess.check_output(KUBE + ["exec", "-i", "mysql-0", "--", "bash", "-c",
                                          'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -D crawling -B -N 2>/dev/null'],
                                  input=sql, text=True, timeout=120).splitlines()
    return {c[0]: (c[1], c[2]) for c in (line.split("\t") for line in tsv) if len(c) == 3}


log = lambda m: print(f"[{dt.datetime.now():%H:%M:%S}] {m}", file=sys.stderr, flush=True)
log("GA4"); g = ga4()
log("카톡방 10분 표본"); flow = room_flow()
log("DB"); d = db()
log("카톡방"); readings = room()
members = {}
for r in readings:  # 그 주 마지막 측정
    iso = dt.date.fromisoformat(r["at"][:10]).isocalendar()
    members[f"{iso[0]}{iso[1]:02d}"] = r["members"]
CH = {"Organic Search": "search_users", "Organic Social": "kakao_channel_users", "Direct": "direct_users"}
PROVIDERS = ["toss", "ali_express", "adpick", "coupang", "naver", "link_price"]

money, traffic, loop = [], [], []
for k, mon in zip(keys, mondays):
    wk = {"week": label(k), "week_start": str(mon)}
    by = {}
    for r in d["sales"]:
        if r["wk"] == k:
            by[r["provider"]] = by.get(r["provider"], 0) + float(r["gross"] or 0)
    ad = sum(float(r["gross"] or 0) for r in d["ad"] if r["wk"] == k)
    row = {**wk, **{p: round(by.get(p, 0)) for p in PROVIDERS},
           "other": round(sum(v for p, v in by.items() if p not in PROVIDERS)), "adsense": round(ad)}
    row["revenue"] = sum(row[p] for p in PROVIDERS + ["other", "adsense"])
    # 실측(2026-10-16): 적재는 다음 날 15:30 이면 다 차고(쿠팡·네이버·애드픽·애드센스가 그때 일괄), 남는 건 늦게 오는 취소뿐 —
    # 애드픽 취소(주문의 ~20%)가 ~1주 뒤, 토스는 취소액의 89% 가 7일 안. 끝난 지 2일이면 잔여 오차가 수익의 ~2% 라
    # (판정 기준 ±10% 안) 그때부터 판정에 넣는다. 월요일 09:45 갱신은 일요일 몫이 아직 안 들어와 뺀다.
    row["provisional"] = (today - (mon + dt.timedelta(days=6))).days < 2
    money.append(row)

    ch = g["channel"].get(k, {})
    traffic.append({**wk, "buy_clicks": g["buy_clicks"].get(k, 0), "buy_users": g["buy_users"].get(k, 0),
                    "web_users": g["web_users"].get(k, 0), **{v: ch.get(c, 0) for c, v in CH.items()}})

    gu = next((r for r in d["guest"] if r["wk"] == k), {})
    su = next((r for r in d["signup"] if r["wk"] == k), {})
    reg = int(gu.get("guest") or 0) + int(su.get("signup") or 0)
    tok = int(gu.get("gtok") or 0) + int(su.get("tok") or 0)
    kakao, opens = g["kakao"].get(k, 0), g["pushopen"].get(k, 0)
    loop.append({**wk, "detail_users": g["detail"].get(k, 0), "prompt_users": g["prompt"].get(k, 0),
                 "registered": reg, "registered_with_token": tok,
                 "push_recipients": next((int(r["recv"]) for r in d["recv"] if r["wk"] == k), 0),
                 "kakao_inflow": kakao, "push_opens": opens, "notified_returns": g["notified"].get(k, 0),
                 "room_members": members.get(k), "app_active": g["app_active"].get(k, 0)})

# 성장 공식 입력. 검색 손님(V_s·k_s)과 단골(카톡 U·J·k_k)을 같은 주에 나란히 둔다 — 파라미터 계산은 대시보드가 한다.
formula = []
for k, mon, m in zip(keys, mondays, money):
    pages = {r["type"]: int(r["n"]) for r in d["pages"] if r["wk"] == k}
    community = pages.get("community")
    formula.append({
        "week": label(k), "week_start": str(mon),
        "search_new": g["new_by_ch"].get(k, {}).get("Organic Search", 0),
        "search_users": g["channel"].get(k, {}).get("Organic Search", 0),
        "search_clicks": g["buy_by_ch"].get(k, {}).get("Organic Search", 0),
        "web_clicks": g["buy_clicks"].get(k, 0),
        "kakao_users": g["kakao"].get(k, 0), "kakao_new": g["kakao_new"].get(k, 0),
        "kakao_clicks": g["kakao_clicks"].get(k, 0),
        "notified_returns": g["notified"].get(k, 0),
        "revenue": m["revenue"], "provisional": m["provisional"],
        # 2026-W31 은 7/27 일괄 이관으로 커뮤니티 딜 64만 건의 createdAt 이 몰려 있다 — 재고 증가로 읽으면 안 되니 비운다.
        "pages_community": None if community and community > 100000 else community,
        "pages_mall": pages.get("mall"),
        # 핫딜 온리방 실측 입장·퇴장(10분 표본, 2026-W42~) — 단골 이탈률을 쿠키 대신 방 인원으로 잰다.
        "room_joins": flow.get(k, {}).get("joins"), "room_leaves": flow.get(k, {}).get("leaves"),
        "room_cover_h": flow.get(k, {}).get("cover_h"), "room_members": flow.get(k, {}).get("members"),
    })

log("Mongo"); mg = mongo()
log("상품 링크"); links = link_of(sorted({pid for _, pid, _ in mg["clicks"]}))
LINKS = ["none", "toss", "link_price", "adpick", "coupang", "ali_express", "naver"]
linkmix = []
for k, mon in zip(keys, mondays):
    if k < CLICKS_SINCE:
        continue
    row = {"week": label(k), "week_start": str(mon), **{p: 0 for p in LINKS}, "other": 0}
    for w, pid, n in mg["clicks"]:
        if w == k:
            p = links.get(pid, ("other", "?"))[0]
            row[p if p in LINKS else "other"] += n
    row["clicks"] = sum(row[p] for p in LINKS + ["other"])
    linkmix.append(row)

# 링크 없는 구매클릭을 딜 출처(커뮤니티·소싱)별로 — 마지막 완료 주. 어느 출처의 무링크부터 메울지 고른다.
last_k = max((w for w, _, _ in mg["clicks"] if w <= keys[-1]), default=None)
by_src = {}
for w, pid, n in mg["clicks"]:
    if w != last_k:
        continue
    link, src = links.get(pid, ("other", "?"))
    r = by_src.setdefault(src, {"source": src, "clicks": 0, "no_link": 0})
    r["clicks"] += n
    r["no_link"] += n if link == "none" else 0
nolink_source = sorted(by_src.values(), key=lambda r: -r["no_link"])
for r in nolink_source:
    r["week"] = label(last_k)
    r["no_link_rate"] = round(r["no_link"] / r["clicks"], 4) if r["clicks"] else None

imp = {s: n for t, s, n in mg["lists"] if t == "post_impression"}
view = {s: n for t, s, n in mg["lists"] if t == "post_view"}
list_ctr = [{"source": s, "impressions": imp.get(s, 0), "views": view.get(s, 0),
             "ctr": round(view.get(s, 0) / imp[s], 5) if imp.get(s) else None,
             "app_mixed": s == "ranking_tab"}  # 앱도 랭킹 탭 노출을 남기지만 앱 진입은 app_detail 이라 CTR 이 낮게 나온다
            for s in CARD_SOURCES if imp.get(s) or view.get(s)]
list_ctr.sort(key=lambda r: -r["impressions"])

os.makedirs(OUT, exist_ok=True)
meta = {"generated": dt.datetime.now().astimezone().isoformat(timespec="seconds"), "from": str(start), "to": str(last_sun)}
log("실험 등록부"); exps = experiments()
for name, rows in (("money", money), ("traffic", traffic), ("loop", loop), ("room", readings), ("experiments", exps),
                   ("linkmix", linkmix), ("list_ctr", list_ctr), ("nolink_source", nolink_source),
                   ("formula", formula)):
    with open(os.path.join(OUT, f"{name}.json"), "w") as f:
        json.dump({"meta": meta, "rows": rows}, f, ensure_ascii=False, indent=1)
print(f"{OUT} — {meta['from']} ~ {meta['to']} ({WEEKS}주)")
