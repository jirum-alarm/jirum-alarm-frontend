#!/usr/bin/env python3
"""주간 깔때기 — 검색으로 한 번 온 사람이 알림 받는 사람이 되는가 (북극성 = 알림 경유 재방문 유저).

2026-10-09 방향 결정: 목표 지표는 사용자 수, 그중 "알림이 도달해 다시 들어온 사람".
검색 유입 D14 0.1% vs 카톡 알림 유입 14.3% — 두 사업 사이 다리(상세→알림 등록→통로→첫 알림)를 매주 잰다.

출처: GA4(속성 394356262, 한국만) + 운영 MySQL(crawling-server 앱 파드 경유, 읽기만).
실행 주체 = 맥 launchd(com.seonkyo.jirum-funnel, 화 10:00 — GA4 처리 지연 때문에 월요일 피함).
설치: install -m 0755 scripts/funnel-weekly.py ~/.local/bin/  (launchd 는 TCC 로 ~/Documents 를 못 읽는다 — 이 파일이 원본)
수동: python3 scripts/funnel-weekly.py [주 수=8]  → 표준출력 + ~/.local/share/jirum/funnel.md + macOS 알림.
읽을 때 주의: 「푸시 열기」는 앱 이벤트가 생긴 2026-W39 부터만 잡힌다(그 전 0 은 미계측).
앱 표(iOS·Android 주간 활성·신규 설치)도 W39 부터다 — Firebase 분석이 실린 버전(iOS 1.4.6·Android 1.4.7)으로 업데이트한
기존 사용자가 first_open 으로 잡혀 W39~W41 은 업데이트 물결이다. 추세는 W43 부터 비교할 것.
「푸시 수신」이 W34→W35 에 1/3 로 준 건 crawling-server d467fc8c(8/18)가 기존 user_token 을 지운 탓 — 재등록 안 한 휴면 유저가 빠졌다.
ponytail: 맥이 꺼져 있으면 그 주는 건너뛴다. 매번 과거 주를 다시 계산하므로 빠진 주도 다음 실행 표에 나온다.
"""
import datetime as dt
import json
import os
import base64
import subprocess
import sys
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

WEEKS = int(sys.argv[1]) if len(sys.argv) > 1 else 8
PROPERTY = "properties/394356262"
SA = os.path.expanduser("~/.config/jirum/gtm-sa.json")
OUT = os.path.expanduser("~/.local/share/jirum/funnel.md")
KUBE = ["kubectl", "--context", "prod", "-n", "crawling-server"]

# 상세에서 "알림 받기" 쪽으로 한 걸음 내디딘 클릭(오카방·키워드·앱 설치·받을 통로 시트).
PROMPT_CLICKS = ["okachat_prompt_click", "keyword_prompt_click", "click_btn_add_notification_keyword",
                 "app_download_click", "click_banner_kakaotalk", "push_channel_sheet_click"]
PUSH_OPENS = ["notification_open", "notification_clicked"]
APP_PLATFORMS = ["iOS", "Android"]
APP = {"filter": {"fieldName": "platform", "inListFilter": {"values": APP_PLATFORMS}}}
RETENTION_WEEKS = [1, 2, 4]  # 리텐션 표 칸 = 첫 방문 주 기준 N주 뒤(1주 뒤 ≈ D7~D13)

today = dt.date.today()
last_sun = today - dt.timedelta(days=today.isoweekday() % 7 or 7)
start = last_sun - dt.timedelta(days=7 * WEEKS - 1)
weeks = [f"{d.isocalendar()[0]}{d.isocalendar()[1]:02d}"
         for d in (start + dt.timedelta(days=7 * i) for i in range(WEEKS))]


def ga4():
    cred = service_account.Credentials.from_service_account_file(
        SA, scopes=["https://www.googleapis.com/auth/analytics.readonly"])
    cred.refresh(google.auth.transport.requests.Request())

    def week_metric(metric, flt, split=None):
        """주별 값. split(측정기준 이름)을 주면 {주: {그 값: n}}."""
        dims = [{"name": "isoYearIsoWeek"}] + ([{"name": split}] if split else [])
        body = {"dateRanges": [{"startDate": str(start), "endDate": str(last_sun)}],
                "dimensions": dims, "metrics": [{"name": metric}], "limit": 1000,
                "dimensionFilter": {"andGroup": {"expressions": [
                    {"filter": {"fieldName": "country", "stringFilter": {"value": "South Korea"}}}, *flt]}}}
        req = urllib.request.Request(
            f"https://analyticsdata.googleapis.com/v1beta/{PROPERTY}:runReport", data=json.dumps(body).encode(),
            headers={"Authorization": "Bearer " + cred.token, "Content-Type": "application/json"})
        rows = json.load(urllib.request.urlopen(req)).get("rows", [])
        if not split:
            return {r["dimensionValues"][0]["value"]: int(r["metricValues"][0]["value"]) for r in rows}
        out = {}
        for r in rows:
            w, k = (v["value"] for v in r["dimensionValues"])
            out.setdefault(w, {})[k] = int(r["metricValues"][0]["value"])
        return out

    def retention(platforms, flt=()):
        """첫 방문 주 코호트 → {코호트 월요일: {N주 뒤: (활성, 코호트 크기)}}. 아직 안 끝난 주의 칸은 버린다."""
        mondays = [start + dt.timedelta(days=7 * i) for i in range(WEEKS)]
        body = {"dimensions": [{"name": "cohort"}, {"name": "cohortNthWeek"}],
                "metrics": [{"name": "cohortActiveUsers"}, {"name": "cohortTotalUsers"}],
                "cohortSpec": {"cohorts": [{"name": str(m), "dimension": "firstSessionDate",
                                            "dateRange": {"startDate": str(m), "endDate": str(m + dt.timedelta(days=6))}}
                                           for m in mondays],
                               "cohortsRange": {"granularity": "WEEKLY", "startOffset": 0, "endOffset": max(RETENTION_WEEKS)}},
                "dimensionFilter": {"andGroup": {"expressions": [
                    {"filter": {"fieldName": "country", "stringFilter": {"value": "South Korea"}}},
                    {"filter": {"fieldName": "platform", "inListFilter": {"values": platforms}}}, *flt]}}, "limit": 1000}
        req = urllib.request.Request(
            f"https://analyticsdata.googleapis.com/v1beta/{PROPERTY}:runReport", data=json.dumps(body).encode(),
            headers={"Authorization": "Bearer " + cred.token, "Content-Type": "application/json"})
        out = {}
        for r in json.load(urllib.request.urlopen(req)).get("rows", []):
            c, n = (v["value"] for v in r["dimensionValues"])
            mon, n = dt.date.fromisoformat(c), int(n)
            if mon + dt.timedelta(days=7 * (n + 1) - 1) <= last_sun:
                out.setdefault(mon, {})[n] = tuple(int(v["value"]) for v in r["metricValues"])
        return out

    ev = lambda names: [{"filter": {"fieldName": "eventName", "inListFilter": {"values": names}}}]
    src = lambda f, v: {"filter": {"fieldName": f, "stringFilter": {"value": v}}}
    # growth-snapshot.py 와 같은 정의 — 세 칸 다 totalUsers, ★ 은 따로 센 값의 합이 아니라 합집합.
    kakao = {"andGroup": {"expressions": [src("sessionSource", "kakao"), src("sessionMedium", "notification")]}}
    push = {"orGroup": {"expressions": [*ev(PUSH_OPENS), src("sessionSource", "notification")]}}
    return {
        # 웹 view_item + 앱 ProductDetail 화면(growth-snapshot.py 와 같은 정의).
        "detail": week_metric("totalUsers", [{"orGroup": {"expressions": [
            *ev(["view_item"]),
            {"andGroup": {"expressions": [*ev(["screen_view"]), src("unifiedScreenName", "ProductDetail")]}}]}}]),
        "prompt": week_metric("totalUsers", ev(PROMPT_CLICKS)),
        "kakao": week_metric("totalUsers", [kakao]),
        "pushopen": week_metric("totalUsers", [push]),
        "notified": week_metric("totalUsers", [{"orGroup": {"expressions": [kakao, push]}}]),
        "app_active": week_metric("activeUsers", [APP], "platform"),
        "app_install": week_metric("totalUsers", [APP, *ev(["first_open"])], "platform"),
        "ret_app": retention(APP_PLATFORMS),
        "ret_web": retention(["web"]),
        # 첫 유입 채널별 — 웹 전체 리텐션은 검색 신규(85%)의 값이라 알림 통로(카톡방 = Organic Social)의 몫이 묻힌다.
        "ret_search": retention(["web"], [src("firstUserDefaultChannelGroup", "Organic Search")]),
        "ret_social": retention(["web"], [src("firstUserDefaultChannelGroup", "Organic Social")]),
    }


# 앱 파드가 아니라 mysql-0 에서 읽는다 — 앱 파드는 배포마다 교체돼 긴 exec 가 137 로 끊긴다(growth-snapshot.py 와 같은 이유, 2026-10-14 재발).
DB_SQL = {
    # user.id<=1682 는 2026-07-27 createdAt 일괄 백필로 가입 시각이 오염됐다.
    "cohort": """SELECT CAST(YEARWEEK(u.createdAt,3) AS CHAR) wk, COUNT(*) signup,
  SUM(EXISTS(SELECT 1 FROM notification_keyword k WHERE k.userId=u.id)) kw,
  SUM(EXISTS(SELECT 1 FROM user_token t WHERE t.userId=u.id AND t.deletedAt IS NULL)) tok,
  SUM(EXISTS(SELECT 1 FROM push_history p WHERE p.userId=u.id AND p.errorCode IS NULL
      AND p.createdAt < u.createdAt + INTERVAL 7 DAY)) push7
  FROM user u WHERE u.id>1682 AND u.isGuest=0 AND u.createdAt>='{s}' AND u.createdAt<'{e}' GROUP BY wk""",
    # 게스트(로그인 없이 알림만 받는 기기 계정, 2026-10-09~) — 가입자가 아니라 따로 센다. 알림 키워드·관심사가 있는 게스트만.
    "guest": """SELECT CAST(YEARWEEK(u.createdAt,3) AS CHAR) wk, COUNT(*) guest,
  SUM(EXISTS(SELECT 1 FROM user_token t WHERE t.userId=u.id AND t.deletedAt IS NULL)) gtok
  FROM user u WHERE u.isGuest=1 AND u.createdAt>='{s}' AND u.createdAt<'{e}'
   AND (EXISTS(SELECT 1 FROM notification_keyword k WHERE k.userId=u.id) OR EXISTS(SELECT 1 FROM user_notification_theme n WHERE n.userId=u.id))
  GROUP BY wk""",
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
    return ({r["wk"]: r for r in out["cohort"]}, {r["wk"]: int(r["recv"]) for r in out["recv"]},
            {r["wk"]: r for r in out["guest"]})


ROOM_SSH = ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", "user@192.168.99.71",
            "cat ~/jirum-kakao-room/counts.csv"]


def room():
    """카톡방(핫딜 온리방) 주말 인원 — 맥 스튜디오 counts.csv(scripts/kakao-room, 2026-10-12~). 못 읽으면 빈 표."""
    try:
        rows = subprocess.check_output(ROOM_SSH, text=True, timeout=30).splitlines()[1:]
    except Exception:
        return {}
    last = {}
    for row in rows:
        at, name, members = (row.split(",") + ["", "", ""])[:3]
        if name != "핫딜 온리방" or not members.isdigit():
            continue
        d = dt.datetime.strptime(at[:19], "%Y-%m-%dT%H:%M:%S").date()
        iso = d.isocalendar()
        last[f"{iso[0]}{iso[1]:02d}"] = int(members)  # 시간순 기록이라 마지막 값 = 그 주 마지막 측정
    return last


def pct(n, d):
    return f"{n:,} ({n / d:.0%})" if d else f"{n:,}"


g = ga4()
cohort, recv, guests = db()
members = room()
lines = [f"# 지름알림 주간 깔때기 ({start} ~ {last_sun}, 생성 {today})", "",
         "★ = 알림 경유 재방문(오카방 유입 ∪ 푸시·알림 열기, 한 사람은 한 번 — 2026-10-14 정의 변경). 앱 푸시 열기 계측은 W39 부터. 가입 코호트는 그 주 가입자 기준, "
         "첫알림7일은 마지막 주가 아직 덜 찼다. 카톡방 인원 = 핫딜 온리방 그 주 마지막 측정(전주 대비 순증, 입장−퇴장).", "",
         "| 주 | 상세 조회 | 알림 권유 클릭 | 게스트 등록(토큰) | 가입 | 키워드 등록 | 토큰 있음 | 첫 알림(7일) | 푸시 수신 | 오카방 유입 | 카톡방 인원 | 푸시 열기 | ★ |",
         "|---|---|---|---|---|---|---|---|---|---|---|---|---|"]
star = {}
for w in weeks:
    c = cohort.get(w, {})
    su, kw, tok, p7 = (int(c.get(k) or 0) for k in ("signup", "kw", "tok", "push7"))
    star[w] = g["notified"].get(w, 0)
    det = g["detail"].get(w, 0)
    gu = guests.get(w, {})
    gcell = f"{int(gu.get('guest') or 0)} ({int(gu.get('gtok') or 0)})"
    i = weeks.index(w)
    mem, before = members.get(w), members.get(weeks[i - 1]) if i else None
    mcell = "—" if mem is None else (f"{mem:,} ({mem - before:+,})" if before is not None else f"{mem:,}")
    lines.append(f"| {w[:4]}-W{w[4:]} | {det:,} | {pct(g['prompt'].get(w, 0), det)} | {gcell} | {su} | {pct(kw, su)} | "
                 f"{pct(tok, su)} | {pct(p7, su)} | {recv.get(w, 0):,} | {g['kakao'].get(w, 0):,} | {mcell} | "
                 f"{g['pushopen'].get(w, 0):,} | **{star[w]:,}** |")
lines += ["", "## 앱 사용자 (주간 활성 · 신규 설치 = first_open)", "",
          "W39~W41 은 계측 시작 업데이트 물결이라 신규가 부풀어 있다 — 추세는 W43 부터.", "",
          "| 주 | 앱 활성 | iOS | Android | 신규 설치 | iOS | Android |", "|---|---|---|---|---|---|---|"]
for w in weeks:
    act, ins = g["app_active"].get(w, {}), g["app_install"].get(w, {})
    a, n = (tuple(d.get(p, 0) for p in APP_PLATFORMS) for d in (act, ins))
    lines.append(f"| {w[:4]}-W{w[4:]} | **{sum(a):,}** | {a[0]:,} | {a[1]:,} | {sum(n):,} | {n[0]:,} | {n[1]:,} |")

lines += ["", "## 리텐션 (첫 방문 주 코호트 → N주 뒤에도 쓴 비율)", "",
          "GA4 firstSessionDate 코호트, 한국만. 앱은 W39~W41 코호트에 업데이트로 처음 잡힌 기존 사용자가 섞여 부풀어 있다 — "
          "W42 코호트부터가 진짜 신규. 웹 재방문이 낮은 건 쿠키 착시가 아니다 — 2026-10-15 실측(W34~W40 코호트): "
          "쿠키 제약 없는 크롬도 1주 뒤 1.5%·4주 뒤 0.6%, 카톡 인앱(Android Webview)은 오히려 28%·11%. "
          "사파리는 ITP(스크립트 쿠키 7일)로 2주 뒤부터 낮게 잡힌다. "
          "아직 안 끝난 주는 «…».", "",
          "| 첫 방문 주 | 앱 신규 | " + " | ".join(f"{n}주 뒤" for n in RETENTION_WEEKS) + " | 웹 신규 | "
          + " | ".join(f"{n}주 뒤" for n in RETENTION_WEEKS) + " |",
          "|---|" + "---|" * (2 * len(RETENTION_WEEKS) + 2)]
for i, w in enumerate(weeks):
    mon = start + dt.timedelta(days=7 * i)
    cells = []
    for ret in (g["ret_app"], g["ret_web"]):
        c = ret.get(mon, {})
        size = c.get(0, (0, 0))[1]
        cells.append(f"{size:,}")
        cells += ["—" if not size else f"{c[n][0] / size:.1%}" if n in c else "…" for n in RETENTION_WEEKS]
    lines.append(f"| {w[:4]}-W{w[4:]} | " + " | ".join(cells) + " |")

lines += ["", "## 웹 리텐션 — 첫 유입 채널별", "",
          "검색으로 처음 온 사람(웹 신규의 ~85%)과 카톡방(Organic Social)으로 처음 온 사람. 두 줄의 차이가 «알림 통로에 들어온 사람만 돌아온다»의 크기다.", "",
          "| 첫 방문 주 | 검색 신규 | " + " | ".join(f"{n}주 뒤" for n in RETENTION_WEEKS) + " | 카톡 신규 | "
          + " | ".join(f"{n}주 뒤" for n in RETENTION_WEEKS) + " |",
          "|---|" + "---|" * (2 * len(RETENTION_WEEKS) + 2)]
for i, w in enumerate(weeks):
    mon = start + dt.timedelta(days=7 * i)
    cells = []
    for ret in (g["ret_search"], g["ret_social"]):
        c = ret.get(mon, {})
        size = c.get(0, (0, 0))[1]
        cells.append(f"{size:,}")
        cells += ["—" if not size else f"{c[n][0] / size:.1%}" if n in c else "…" for n in RETENTION_WEEKS]
    lines.append(f"| {w[:4]}-W{w[4:]} | " + " | ".join(cells) + " |")


NID_SINCE = dt.date(2026, 10, 15)  # push_history.nid·user_history.nid 수집 시작(crawling-server 5eb25c7c, 앱·웹 v1.105.0)
CRAWLING = os.path.expanduser("~/Documents/github/jirum-alarm/jirum-alarm-crawling-server")
NID_JS = r"""
const { MongoClient } = require(process.env.MONGO_DRIVER);
(async () => { const c = await MongoClient.connect(process.env.MONGO_URI);
  const h = c.db('jirum-alarm').collection('user_history'); const [s, e] = process.argv.slice(1).map((d) => new Date(d));
  const q = (t) => h.distinct('nid', { target: t, nid: { $exists: true }, createdAt: { $gte: s, $lt: e } }, { maxTimeMS: 300000 });
  console.log(JSON.stringify({ view: await q('post_view'), buy: await q('purchase_link_click') })); await c.close();
})().catch((x) => { console.error('ERR', x.message); process.exit(1); });
"""


def notif_attribution(s, e):
    """지난주 알림 종류(push_history.target)별 발송 → 열람(post_view) → 구매 클릭을 nid 로 잇는다."""
    sql = (f"SELECT nid, COALESCE(target,'(없음)') FROM push_history WHERE nid IS NOT NULL AND errorCode IS NULL "
           f"AND createdAt>='{s}' AND createdAt<'{e}'")
    sent = [l.split("\t") for l in subprocess.check_output(
        KUBE + ["exec", "mysql-0", "--", "bash", "-c",
                'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -D crawling -B -N -e "$0" 2>/dev/null', sql],
        text=True, timeout=120).splitlines() if l]
    # 열람·구매는 발송 뒤 며칠 걸쳐 일어난다 — 끝 경계를 이틀 늘려 지난주 발송분의 늦은 열람까지 센다.
    pw = base64.b64decode(subprocess.check_output(["kubectl", "--context", "prod", "-n", "mongodb", "get", "secret", "mongodb",
                                                   "-o", "jsonpath={.data.mongodb-root-password}"], text=True)).decode()
    pf = subprocess.Popen(["kubectl", "--context", "prod", "-n", "mongodb", "port-forward", "pod/mongodb-1", "27119:27017"],
                          stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        time.sleep(3)
        env = {**os.environ, "MONGO_DRIVER": os.path.join(CRAWLING, "node_modules/mongodb"),
               "MONGO_URI": f"mongodb://root:{urllib.parse.quote(pw, safe='')}@localhost:27119/jirum-alarm?authSource=admin"
                            "&readPreference=secondaryPreferred&directConnection=true"}
        got = json.loads(subprocess.check_output(["node", "-e", NID_JS, f"{s}T00:00:00+09:00",
                                                  f"{e + dt.timedelta(days=2)}T00:00:00+09:00"], env=env, text=True, timeout=600))
    finally:
        pf.terminate()
    view, buy = set(got["view"]), set(got["buy"])
    by = {}
    for nid, target in sent:
        r = by.setdefault(target, [0, 0, 0])
        r[0] += 1
        r[1] += nid in view
        r[2] += nid in buy
    return sorted(by.items(), key=lambda kv: -kv[1][0])


wk_s, wk_e = last_sun - dt.timedelta(days=6), last_sun + dt.timedelta(days=1)
if wk_e > NID_SINCE:
    lines += ["", f"## 알림 종류별 발송 → 열람 → 구매 클릭 ({wk_s} ~ {last_sun} 발송, nid 귀속)", "",
              "발송 = 성공한 기기별 푸시(push_history), 열람·구매 = 그 푸시의 nid 가 실린 상세 진입·구매 클릭(user_history, 발송 주 + 이틀). "
              "nid 를 안 보내는 옛 앱·웹 진입은 빠져 «최소값»이다.", "",
              "| 알림 종류 | 발송 | 열람 | 열람률 | 구매 클릭 | 발송당 구매 |", "|---|---|---|---|---|---|"]
    try:
        for target, (n, v, b) in notif_attribution(max(wk_s, NID_SINCE), wk_e):
            rate = lambda x: f"{x / n:.1%}" if n else "—"
            lines.append(f"| {target} | {n:,} | {v:,} | {rate(v)} | {b:,} | {rate(b)} |")
    except Exception as x:  # 귀속 표 실패가 주간 리포트 전체를 막지 않게
        lines.append(f"| (집계 실패: {type(x).__name__}) | | | | | |")
report = "\n".join(lines) + "\n"
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as f:
    f.write(report)
print(report)

cur, prev = star[weeks[-1]], star[weeks[-2]] if WEEKS > 1 else 0
app_now = sum(g["app_active"].get(weeks[-1], {}).values())
msg = f"알림 경유 재방문 {cur:,}명 (전주 {prev:,}) · 앱 활성 {app_now:,}명 — {OUT}"
subprocess.run(["osascript", "-e", f'display notification "{msg}" with title "지름알림 주간 깔때기"'], check=False)
