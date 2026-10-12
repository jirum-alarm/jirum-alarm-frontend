"""공유 카드(v1.76.1, 2026-10-12) 효과 판정 — 1회성. launchd 가 2026-11-10 10:00 에 부른다.

바꾼 것: 공유 링크의 카톡·X·스레드 미리보기를 상품 사진 → 배지·가격 카드(api/og/product/{id}.jpg)로.
그래서 볼 숫자 = 받은 사람이 눌렀나 = **상품 공유 1건당 상품 랜딩 공유 유입 세션**.

판정 규칙(켜기 전에 확정 — 바꾸지 않는다. jirum-marketing-loop §3):
- R  = 공유 유입 세션(sessionSource=share, 랜딩 /products/, KR+봇게이트) ÷ web 상품 화면 share_channel_click(KR)
- 기준 R0 = 0.82 (2026-09-23~10-11; share_channel_click 은 9/23 부터 찍힘. 전반 0.90·후반 0.76)
- 판정 구간: 전반 10/13~10/26, 후반 10/27~11/09
- 승 = 두 구간 모두 R ≥ 0.98(R0 +20%) / 패 = 두 구간 모두 R ≤ 0.82 / 그 외 보류
- 표본: 판정 구간 share_channel_click 합 < 50 이면 무조건 보류
- 참고(판정엔 안 씀): R' = 같은 세션 ÷ click_btn_share(시트 열기, 8주 0.63~0.72), 공유 유입 신규 사용자.
- 섞인 변경: v1.76.0 웹→앱 넘기기(10/12) — 앱이 깔린 수신자는 웹 랜딩 뒤 앱으로 갈 수 있다(웹 세션은 먼저 잡힌다).
  카톡이 수정 전에 긁어 간 링크는 캐시가 풀릴 때까지 옛 사진이다(10/12 시험한 몇 개뿐).

수동: python3 scripts/share-card-verdict.py  → 표준출력 + ~/.local/share/jirum/share-card-verdict.md + macOS 알림.
설치본 = ~/.local/bin (launchd 는 TCC 로 ~/Documents 를 못 읽는다). 끝나면 launchd 항목을 스스로 내린다.
"""

import datetime
import json
import os
import subprocess
import urllib.request

import google.auth.transport.requests
from google.oauth2 import service_account

PROPERTY = "properties/394356262"
OUT = os.path.expanduser("~/.local/share/jirum/share-card-verdict.md")
PLIST = os.path.expanduser("~/Library/LaunchAgents/com.seonkyo.jirum-share-verdict.plist")
R0, WIN, LOSE, MIN_CLICKS = 0.82, 0.98, 0.82, 50
HALVES = [("2026-10-13", "2026-10-26"), ("2026-10-27", "2026-11-09")]

if datetime.date.today() < datetime.date(2026, 11, 10):
    print("판정일(2026-11-10) 전 — 데이터가 다 안 찼다. 끝.")
    raise SystemExit(0)

cred = service_account.Credentials.from_service_account_file(
    os.path.expanduser("~/.config/jirum/gtm-sa.json"),
    scopes=["https://www.googleapis.com/auth/analytics.readonly"],
)
cred.refresh(google.auth.transport.requests.Request())


def run(body):
    req = urllib.request.Request(
        f"https://analyticsdata.googleapis.com/v1beta/{PROPERTY}:runReport",
        data=json.dumps(body).encode(),
        headers={"Authorization": "Bearer " + cred.token, "Content-Type": "application/json"},
    )
    return json.load(urllib.request.urlopen(req)).get("rows", [])


KR = {"filter": {"fieldName": "country", "stringFilter": {"value": "South Korea"}}}
BOT = {"notExpression": {"andGroup": {"expressions": [
    {"filter": {"fieldName": "deviceCategory", "stringFilter": {"value": "desktop"}}},
    {"filter": {"fieldName": "operatingSystem", "stringFilter": {"value": "Windows"}}},
]}}}


def web_product_events(dr, name):
    rows = run({
        "dateRanges": dr,
        "dimensions": [{"name": "platform"}, {"name": "pagePath"}],
        "metrics": [{"name": "eventCount"}],
        "dimensionFilter": {"andGroup": {"expressions": [
            KR, {"filter": {"fieldName": "eventName", "stringFilter": {"value": name}}}]}},
        "limit": 5000,
    })
    return sum(
        int(r["metricValues"][0]["value"]) for r in rows
        if r["dimensionValues"][0]["value"] == "web" and "/products/" in r["dimensionValues"][1]["value"]
    )


def share_sessions(dr):
    rows = run({
        "dateRanges": dr,
        "dimensions": [{"name": "landingPage"}],
        "metrics": [{"name": "sessions"}, {"name": "newUsers"}],
        "dimensionFilter": {"andGroup": {"expressions": [
            KR, BOT, {"filter": {"fieldName": "sessionSource", "stringFilter": {"value": "share"}}}]}},
        "limit": 5000,
    })
    s = n = 0
    for r in rows:
        if r["dimensionValues"][0]["value"].startswith("/products/"):
            s += int(r["metricValues"][0]["value"])
            n += int(r["metricValues"][1]["value"])
    return s, n


lines, rs, total_clicks = [], [], 0
for start, end in HALVES:
    dr = [{"startDate": start, "endDate": end}]
    clicks, opens = web_product_events(dr, "share_channel_click"), web_product_events(dr, "click_btn_share")
    sess, new = share_sessions(dr)
    r = sess / clicks if clicks else None
    rs.append(r)
    total_clicks += clicks
    r_txt = f"{r:.2f}" if r is not None else "-"
    r2_txt = f"{sess / opens:.2f}" if opens else "-"
    lines.append(f"| {start}~{end} | {clicks} | {opens} | {sess} | {new} | {r_txt} | {r2_txt} |")

if total_clicks < MIN_CLICKS or any(r is None for r in rs):
    verdict = f"보류 — 표본 부족(채널 클릭 {total_clicks} < {MIN_CLICKS})"
elif all(r >= WIN for r in rs):
    verdict = "승 — 두 구간 모두 R ≥ 0.98"
elif all(r <= LOSE for r in rs):
    verdict = "패 — 두 구간 모두 R ≤ 0.82(기준 이하)"
else:
    verdict = "보류 — 두 구간 방향이 엇갈리거나 +20% 미만"

report = "\n".join([
    "# 공유 카드 효과 판정 (v1.76.1)",
    "",
    f"판정: **{verdict}**",
    "",
    f"기준 R0 = {R0} (2026-09-23~10-11). 승 ≥ {WIN} 두 구간 모두 / 패 ≤ {LOSE} 두 구간 모두.",
    "",
    "| 구간 | 채널 클릭 | 시트 열기 | 공유 세션(상품) | 신규 | R | R' |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    *lines,
    "",
    "규칙·섞인 변경은 frontend scripts/share-card-verdict.py 머리말. 결과는 /jirum-save 로 vault verification/ 에.",
])
print(report)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as f:
    f.write(report + "\n")
subprocess.run(
    ["osascript", "-e", f'display notification "{verdict} — {OUT}" with title "지름알림 공유 카드 판정"'],
    check=False,
)

# 1회성 — 내년 같은 날 다시 돌지 않게 launchd 항목을 내린다.
if os.path.exists(PLIST):
    subprocess.run(["launchctl", "unload", PLIST], check=False)
    os.rename(PLIST, PLIST + ".done")
