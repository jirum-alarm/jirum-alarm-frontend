#!/usr/bin/env python3
"""그로스 트리 스냅샷 — 그로스 대시보드(claude.ai 아티팩트 「지름알림 그로스 트리」)가 읽는 주간 JSON 네 개.

지표 트리(jirum vault domain/service-key-metrics.md)의 두 축을 같은 주 단위로 맞춰 뽑는다.
- money.json   돈의 식: 주간 수익(제휴처별) — 운영 MySQL affiliate_sales·ad_revenue_daily
- traffic.json 구매클릭·웹 활성·채널별 활성 — GA4(한국만, 사용자 지표는 봇게이트 desktop∧Windows 제외)
- loop.json    북극성(알림 경유 재방문)과 그 앞단 — GA4 + 운영 MySQL + 카톡방 counts.csv. funnel-weekly.py 와 같은 정의
- experiments.json 실험 등록부(crawling-server src/experiment/experiment-registry.ts)

수동: python3 scripts/growth-snapshot.py [주 수=16]  → ~/.local/share/jirum/growth/*.json
대시보드 https://claude.ai/artifact/BhUKjPYmSFP7WEzX6Vh7wp 반영은 Orca 정기 자동화(Claude 세션)가 이 파일들을 올린다
— launchd 는 아티팩트에 못 올린다. 설치: install -m 0755 scripts/growth-snapshot.py ~/.local/bin/
"""
import datetime as dt
import json
import os
import subprocess
import sys
import tempfile
import urllib.request

import google.auth.transport.requests
from google.oauth2 import service_account

WEEKS = int(sys.argv[1]) if len(sys.argv) > 1 else 16
PROPERTY = "properties/394356262"
SA = os.path.expanduser("~/.config/jirum/gtm-sa.json")
OUT = os.path.expanduser("~/.local/share/jirum/growth")
KUBE = ["kubectl", "--context", "prod", "-n", "crawling-server"]
CRAWLING = os.path.expanduser("~/Documents/github/jirum-alarm/jirum-alarm-crawling-server")

PROMPT_CLICKS = ["okachat_prompt_click", "keyword_prompt_click", "click_btn_add_notification_keyword",
                 "app_download_click", "click_banner_kakaotalk", "push_channel_sheet_click"]
PUSH_OPENS = ["notification_open", "notification_clicked"]

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
        "buy_clicks": q("eventCount", [web, ev(["click_btn_buy"])]),
        "buy_users": q("totalUsers", [web, bot, ev(["click_btn_buy"])]),
        "web_users": q("activeUsers", [web, bot]),
        "channel": q("activeUsers", [web, bot], "sessionDefaultChannelGroup"),
        "detail": q("totalUsers", [ev(["view_item"])]),
        "prompt": q("totalUsers", [ev(PROMPT_CLICKS)]),
        "kakao": q("activeUsers", [src("sessionSource", "kakao"), src("sessionMedium", "notification")]),
        "pushopen": q("totalUsers", [ev(PUSH_OPENS)]),
        "app_active": q("activeUsers", [app]),
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


EXP_JS = r"""
const { EXPERIMENTS } = require('./src/experiment/experiment-registry');
console.log(JSON.stringify(EXPERIMENTS.map(e => ({ id: e.id, kind: e.kind, status: e.status, title: e.title,
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


log = lambda m: print(f"[{dt.datetime.now():%H:%M:%S}] {m}", file=sys.stderr, flush=True)
log("GA4"); g = ga4()
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
                 "kakao_inflow": kakao, "push_opens": opens, "notified_returns": kakao + opens,
                 "room_members": members.get(k), "app_active": g["app_active"].get(k, 0)})

os.makedirs(OUT, exist_ok=True)
meta = {"generated": dt.datetime.now().astimezone().isoformat(timespec="seconds"), "from": str(start), "to": str(last_sun)}
log("실험 등록부"); exps = experiments()
for name, rows in (("money", money), ("traffic", traffic), ("loop", loop), ("room", readings), ("experiments", exps)):
    with open(os.path.join(OUT, f"{name}.json"), "w") as f:
        json.dump({"meta": meta, "rows": rows}, f, ensure_ascii=False, indent=1)
print(f"{OUT} — {meta['from']} ~ {meta['to']} ({WEEKS}주)")
