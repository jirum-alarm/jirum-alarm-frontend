#!/usr/bin/env python3
"""계측 감시 — GA4 이벤트가 조용히 죽으면 다음 날 아침에 알린다.

왜: GTM 트리거·변수는 깨져도 경고 없이 0건이 된다. 실제로 purchase_link_click 파라미터 유실(6주, 2026-09-02 발견),
Mixpanel 전용 태그 15종(7주, 09-22 발견), 웹 sign_up 35%만 집계(10-05 발견)를 모두 사람이 우연히 찾았다.

어제(KST) 하루를 직전 14일과 비교해 네 가지를 본다. 알림은 이상이 있을 때만 간다.
  A. 이벤트 급감 — 직전 7일 중앙값 하루 20건 이상인 이벤트가 어제 그 30% 미만(7일이라 의도된 변경은 며칠 안에 기준이 따라온다)
  B. 파라미터 빈값 — 아래 PARAMS 의 채움 비율이 기준의 절반 아래로(GTM 변수 키 불일치 같은 것)
  C. GA4 ÷ DB 비율 급락 — 같은 행동을 서버도 센다(PAIRS). 둘이 같이 줄면 진짜 감소, GA4 만 줄면 계측 고장
  D. 웹 user_id — 앱엔 로그인 사용자가 있는데 웹은 0명(GTM v56 에서 붙였다, 2026-10-16)

출처: GA4(속성 394356262) + 운영 MySQL(mysql-0, 읽기) + Mongo user_history(mongodb-1 secondary, 읽기).
실행 주체 = 맥 launchd(com.seonkyo.jirum-tracking-watch, 매일 09:40). 알림 = macOS 알림 + MATTERMOST_WEBHOOK_URL 이 있으면 Mattermost.
설치: install -m 0755 scripts/tracking-watch.py ~/.local/bin/  (launchd 는 TCC 로 ~/Documents 를 못 읽는다 — 이 파일이 원본)
수동: python3 scripts/tracking-watch.py [기준일=어제 YYYY-MM-DD]  → 표준출력 + ~/.local/share/jirum/tracking-watch.md
알림 판독: 먼저 그날 frontend 커밋(`git log --since=<전날> -- apps/web`)을 본다. 첫 실행(10/15)의 두 건은 둘 다 의도된 변경이었다 —
search_no_result 0건 = 숨은 0건 화면 오발화 수리(ed40a0bd), app_alert_hook_view −60% = 시트 숨김 실험·카톡 인앱 앱 다리(d4740e9a·56f4725f).
"""
import datetime as dt
import json
import os
import statistics
import subprocess
import sys
import urllib.request

import google.auth.transport.requests
from google.oauth2 import service_account


def _notify_failure(kind, exc, tb):
    """launchd 는 실패해도 조용하다 — 죽으면 macOS 알림으로 알린다. traceback 은 그대로 로그로."""
    sys.__excepthook__(kind, exc, tb)
    msg = f"{os.path.basename(__file__)}: {kind.__name__}: {exc}"[:200].replace("\"", "'").replace("\\", "/")
    subprocess.run(["osascript", "-e", f"display notification \"{msg}\" with title \"지름알림 지표 작업 실패\" sound name \"Basso\""],
                   check=False)


sys.excepthook = _notify_failure

PROPERTY = "properties/394356262"
SA = os.path.expanduser("~/.config/jirum/gtm-sa.json")
OUT = os.path.expanduser("~/.local/share/jirum/tracking-watch.md")
BASE_DAYS = 14
DROP_MIN_MEDIAN, DROP_RATIO, DROP_BASE_DAYS = 20, 0.3, 7
# (GA4 이벤트, 맞춤 측정기준 파라미터) — 비면 리포트에서 쪼갤 수 없게 되는 것들.
PARAMS = [("keyword_register", "source"), ("keyword_register", "keyword"), ("product_card_click", "source"),
          ("click_btn_buy", "profit_provider"), ("search_no_result", "keyword"), ("product_wish", "product_id"),
          ("share_channel_click", "share_channel")]
# 같은 행동의 GA4 이벤트(웹·앱 이름이 다르다) ↔ 서버 기록.
PAIRS = {
    "구매 클릭": (["click_btn_buy", "purchase_link_click"], ("mongo", "purchase_link_click")),
    "키워드 등록": (["keyword_register"], ("mongo", "notification_keyword_add")),
    "회원가입": (["sign_up", "signup_complete"], ("mysql", "signup")),
}
WEB_USER_ID_SINCE = dt.date(2026, 10, 17)  # GTM v56(10/16 08시 게시) 다음 날부터 판정

day = dt.date.fromisoformat(sys.argv[1]) if len(sys.argv) > 1 else dt.date.today() - dt.timedelta(days=1)
start = day - dt.timedelta(days=BASE_DAYS)
dates = [start + dt.timedelta(days=i) for i in range(BASE_DAYS + 1)]


def ga4():
    cred = service_account.Credentials.from_service_account_file(
        SA, scopes=["https://www.googleapis.com/auth/analytics.readonly"])
    cred.refresh(google.auth.transport.requests.Request())

    def report(dims, flt=None, metric="eventCount", first=start):
        body = {"dateRanges": [{"startDate": str(first), "endDate": str(day)}],
                "dimensions": [{"name": d} for d in dims], "metrics": [{"name": metric}], "limit": 100000}
        if flt:
            body["dimensionFilter"] = flt
        req = urllib.request.Request(
            f"https://analyticsdata.googleapis.com/v1beta/{PROPERTY}:runReport", data=json.dumps(body).encode(),
            headers={"Authorization": "Bearer " + cred.token, "Content-Type": "application/json"})
        return [([v["value"] for v in r["dimensionValues"]], int(r["metricValues"][0]["value"]))
                for r in json.load(urllib.request.urlopen(req)).get("rows", [])]

    ev = lambda names: {"filter": {"fieldName": "eventName", "inListFilter": {"values": names}}}
    events = {}  # {이벤트: {날짜: 건수}}
    for (d, name), n in report(["date", "eventName"]):
        events.setdefault(name, {})[dt.datetime.strptime(d, "%Y%m%d").date()] = n
    params = {}  # {(이벤트, 파라미터): {날짜: (채움, 전체)}}
    for param in sorted({p for _, p in PARAMS}):
        names = [e for e, p in PARAMS if p == param]
        for (d, name, val), n in report(["date", "eventName", f"customEvent:{param}"], ev(names)):
            cell = params.setdefault((name, param), {})
            filled, total = cell.get(dt.datetime.strptime(d, "%Y%m%d").date(), (0, 0))
            cell[dt.datetime.strptime(d, "%Y%m%d").date()] = (filled + (n if val not in ("", "(not set)") else 0), total + n)
    signed = {}  # {platform: 어제 user_id 붙은 활성 사용자}
    for (platform, flag), n in report(["platform", "signedInWithUserId"], metric="activeUsers", first=day):
        if flag == "yes":
            signed[platform] = n
    return events, params, signed


def mysql():
    sql = ("SELECT /*+ MAX_EXECUTION_TIME(15000) */ DATE(createdAt), COUNT(*) FROM user "
           f"WHERE isGuest = 0 AND createdAt >= '{start}' AND createdAt < '{day + dt.timedelta(days=1)}' GROUP BY 1")
    tsv = subprocess.check_output(
        ["kubectl", "--context", "prod", "-n", "crawling-server", "exec", "mysql-0", "--", "bash", "-c",
         'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -D crawling -B -N -e "$0" 2>/dev/null', sql], text=True, timeout=120)
    return {"signup": {dt.date.fromisoformat(d): int(n) for d, n in (l.split("\t") for l in tsv.splitlines() if l)}}


def mongo():
    targets = sorted({t for _, (src, t) in PAIRS.values() if src == "mongo"})
    js = (f'db = db.getSiblingDB("jirum-alarm"); db.getMongo().setReadPref("secondaryPreferred");'
          f'print(JSON.stringify(db.user_history.aggregate([{{$match: {{createdAt: {{$gte: new Date("{start}T00:00:00+09:00"),'
          f' $lt: new Date("{day + dt.timedelta(days=1)}T00:00:00+09:00")}}, target: {{$in: {json.dumps(targets)}}}}}}},'
          f' {{$group: {{_id: {{t: "$target", d: {{$dateToString: {{format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Seoul"}}}}}},'
          f' n: {{$sum: 1}}}}}}], {{maxTimeMS: 90000}}).toArray()))')
    raw = subprocess.check_output(
        ["kubectl", "--context", "prod", "-n", "mongodb", "exec", "mongodb-1", "-c", "mongodb", "--", "bash", "-c",
         'mongosh --quiet -u root -p "$(cat $MONGODB_ROOT_PASSWORD_FILE)" --authenticationDatabase admin --eval "$0"', js],
        text=True, timeout=180)
    out = {}
    for r in json.loads(raw.strip().splitlines()[-1]):
        out.setdefault(r["_id"]["t"], {})[dt.date.fromisoformat(r["_id"]["d"])] = r["n"]
    return out


def median_before(series, days=BASE_DAYS):
    return statistics.median(series.get(d, 0) for d in dates[-1 - days:-1])


def checks(events, params, signed, db):
    alerts, notes = [], []
    for name, series in sorted(events.items()):
        med = median_before(series, DROP_BASE_DAYS)
        y = series.get(day, 0)
        if med >= DROP_MIN_MEDIAN and y < med * DROP_RATIO:
            alerts.append(f"A 급감 `{name}` 어제 {y}건 ← 7일 중앙값 {med:g}건")
    for (name, param), series in sorted(params.items()):
        base = [f / t for d, (f, t) in series.items() if d != day and t >= 10]
        f, t = series.get(day, (0, 0))
        if len(base) >= 5 and t >= 10 and statistics.median(base) >= 0.5 and f / t < statistics.median(base) / 2:
            alerts.append(f"B 빈값 `{name}.{param}` 어제 채움 {f / t:.0%} ← 기준 {statistics.median(base):.0%} ({t}건 중)")
    for label, (names, (src, key)) in PAIRS.items():
        ga = {d: sum(events.get(n, {}).get(d, 0) for n in names) for d in dates}
        srv = db.get(key, {})
        ratios = [ga[d] / srv[d] for d in dates[:-1] if srv.get(d, 0) >= 10]
        y_srv, y_ga = srv.get(day, 0), ga[day]
        line = f"{label}: GA4 {y_ga} / 서버 {y_srv}"
        if len(ratios) >= 5 and y_srv >= 10:
            base = statistics.median(ratios)
            line += f" = {y_ga / y_srv:.2f} (기준 {base:.2f})"
            if y_ga / y_srv < base / 2:
                alerts.append(f"C 비율 급락 {line}")
        notes.append(line)
    web = signed.get("web", 0)
    app = signed.get("iOS", 0) + signed.get("Android", 0)
    notes.append(f"user_id 붙은 활성 사용자: 웹 {web} / 앱 {app}")
    if day >= WEB_USER_ID_SINCE and web == 0 and app > 0:
        alerts.append(f"D 웹 user_id 0명 (앱 {app}명) — GTM `user_id (dlv)` 연결 확인")
    return alerts, notes


def notify(alerts):
    head = f"계측 감시 {day}: 이상 {len(alerts)}건"
    msg = (head + " — " + alerts[0])[:200].replace("\"", "'").replace("\\", "/").replace("`", "")
    subprocess.run(["osascript", "-e", f"display notification \"{msg}\" with title \"지름알림 계측 감시\" sound name \"Basso\""],
                   check=False)
    hook = os.environ.get("MATTERMOST_WEBHOOK_URL")
    if hook:
        text = "#### :warning: " + head + "\n" + "\n".join("- " + a for a in alerts) + f"\n\n상세: `{OUT}` (맥)"
        req = urllib.request.Request(hook, data=json.dumps({"text": text}).encode(), headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req, timeout=15)


def main():
    events, params, signed = ga4()
    db = {**mysql(), **mongo()}
    alerts, notes = checks(events, params, signed, db)
    report = "\n".join([f"# 계측 감시 — {day} (기준 {start} ~ {day - dt.timedelta(days=1)})", "",
                        "## 이상", *(["- " + a for a in alerts] or ["- 없음"]), "", "## 대조", *("- " + n for n in notes), ""])
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        f.write(report)
    print(report)
    if alerts:
        notify(alerts)


if __name__ == "__main__":
    main()
