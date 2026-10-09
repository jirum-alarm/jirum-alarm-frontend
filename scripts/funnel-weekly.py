#!/usr/bin/env python3
"""주간 깔때기 — 검색으로 한 번 온 사람이 알림 받는 사람이 되는가 (북극성 = 알림 경유 재방문 유저).

2026-10-09 방향 결정: 목표 지표는 사용자 수, 그중 "알림이 도달해 다시 들어온 사람".
검색 유입 D14 0.1% vs 카톡 알림 유입 14.3% — 두 사업 사이 다리(상세→알림 등록→통로→첫 알림)를 매주 잰다.

출처: GA4(속성 394356262, 한국만) + 운영 MySQL(crawling-server 앱 파드 경유, 읽기만).
실행 주체 = 맥 launchd(com.seonkyo.jirum-funnel, 화 10:00 — GA4 처리 지연 때문에 월요일 피함).
설치: install -m 0755 scripts/funnel-weekly.py ~/.local/bin/  (launchd 는 TCC 로 ~/Documents 를 못 읽는다 — 이 파일이 원본)
수동: python3 scripts/funnel-weekly.py [주 수=8]  → 표준출력 + ~/.local/share/jirum/funnel.md + macOS 알림.
읽을 때 주의: 「푸시 열기」는 앱 이벤트가 생긴 2026-W39 부터만 잡힌다(그 전 0 은 미계측).
「푸시 수신」이 W34→W35 에 1/3 로 준 건 crawling-server d467fc8c(8/18)가 기존 user_token 을 지운 탓 — 재등록 안 한 휴면 유저가 빠졌다.
ponytail: 맥이 꺼져 있으면 그 주는 건너뛴다. 매번 과거 주를 다시 계산하므로 빠진 주도 다음 실행 표에 나온다.
"""
import datetime as dt
import json
import os
import subprocess
import sys
import urllib.request

import google.auth.transport.requests
from google.oauth2 import service_account

WEEKS = int(sys.argv[1]) if len(sys.argv) > 1 else 8
PROPERTY = "properties/394356262"
SA = os.path.expanduser("~/.config/jirum/gtm-sa.json")
OUT = os.path.expanduser("~/.local/share/jirum/funnel.md")
KUBE = ["kubectl", "--context", "prod", "-n", "crawling-server"]

# 상세에서 "알림 받기" 쪽으로 한 걸음 내디딘 클릭(오카방·키워드·앱 설치·받을 통로 시트).
PROMPT_CLICKS = ["okachat_prompt_click", "keyword_prompt_click", "click_btn_add_notification_keyword",
                 "app_download_click", "click_banner_kakaotalk", "push_channel_sheet_click"]
PUSH_OPENS = ["notification_open", "notification_clicked"]

today = dt.date.today()
last_sun = today - dt.timedelta(days=today.isoweekday() % 7 or 7)
start = last_sun - dt.timedelta(days=7 * WEEKS - 1)
weeks = [f"{d.isocalendar()[0]}{d.isocalendar()[1]:02d}"
         for d in (start + dt.timedelta(days=7 * i) for i in range(WEEKS))]


def ga4():
    cred = service_account.Credentials.from_service_account_file(
        SA, scopes=["https://www.googleapis.com/auth/analytics.readonly"])
    cred.refresh(google.auth.transport.requests.Request())

    def week_metric(metric, flt):
        body = {"dateRanges": [{"startDate": str(start), "endDate": str(last_sun)}],
                "dimensions": [{"name": "isoYearIsoWeek"}], "metrics": [{"name": metric}],
                "dimensionFilter": {"andGroup": {"expressions": [
                    {"filter": {"fieldName": "country", "stringFilter": {"value": "South Korea"}}}, *flt]}}}
        req = urllib.request.Request(
            f"https://analyticsdata.googleapis.com/v1beta/{PROPERTY}:runReport", data=json.dumps(body).encode(),
            headers={"Authorization": "Bearer " + cred.token, "Content-Type": "application/json"})
        rows = json.load(urllib.request.urlopen(req)).get("rows", [])
        return {r["dimensionValues"][0]["value"]: int(r["metricValues"][0]["value"]) for r in rows}

    ev = lambda names: [{"filter": {"fieldName": "eventName", "inListFilter": {"values": names}}}]
    src = lambda f, v: {"filter": {"fieldName": f, "stringFilter": {"value": v}}}
    return {
        "detail": week_metric("totalUsers", ev(["view_item"])),
        "prompt": week_metric("totalUsers", ev(PROMPT_CLICKS)),
        "kakao": week_metric("activeUsers", [src("sessionSource", "kakao"), src("sessionMedium", "notification")]),
        "pushopen": week_metric("totalUsers", ev(PUSH_OPENS)),
    }


DB_JS = r"""
const c=require("/var/www/html/ormconfig.json");const m=require("mysql2/promise");
(async()=>{const cn=await m.createConnection({host:c.host,port:c.port,user:c.username,password:c.password,database:c.database,dateStrings:true});
const [s,e]=process.argv.slice(1);
// user.id<=1682 는 2026-07-27 createdAt 일괄 백필로 가입 시각이 오염됐다.
const [cohort]=await cn.query(`SELECT CAST(YEARWEEK(u.createdAt,3) AS CHAR) wk, COUNT(*) signup,
  SUM(EXISTS(SELECT 1 FROM notification_keyword k WHERE k.userId=u.id)) kw,
  SUM(EXISTS(SELECT 1 FROM user_token t WHERE t.userId=u.id AND t.deletedAt IS NULL)) tok,
  SUM(EXISTS(SELECT 1 FROM push_history p WHERE p.userId=u.id AND p.errorCode IS NULL
      AND p.createdAt < u.createdAt + INTERVAL 7 DAY)) push7
  FROM user u WHERE u.id>1682 AND u.isGuest=0 AND u.createdAt>=? AND u.createdAt<? GROUP BY wk`,[s,e]);
// 게스트(로그인 없이 알림만 받는 기기 계정, 2026-10-09~) — 가입자가 아니라 따로 센다. 알림 키워드·관심사가 있는 게스트만.
const [guest]=await cn.query(`SELECT CAST(YEARWEEK(u.createdAt,3) AS CHAR) wk, COUNT(*) guest,
  SUM(EXISTS(SELECT 1 FROM user_token t WHERE t.userId=u.id AND t.deletedAt IS NULL)) gtok
  FROM user u WHERE u.isGuest=1 AND u.createdAt>=? AND u.createdAt<?
   AND (EXISTS(SELECT 1 FROM notification_keyword k WHERE k.userId=u.id) OR EXISTS(SELECT 1 FROM user_notification_theme n WHERE n.userId=u.id))
  GROUP BY wk`,[s,e]);
const [recv]=await cn.query(`SELECT CAST(YEARWEEK(createdAt,3) AS CHAR) wk, COUNT(DISTINCT userId) recv
  FROM push_history WHERE userId IS NOT NULL AND errorCode IS NULL AND createdAt>=? AND createdAt<? GROUP BY wk`,[s,e]);
console.log(JSON.stringify({cohort,recv,guest}));await cn.end();})().catch(x=>{console.error("ERR",x.message);process.exit(1)});
"""


def db():
    pod = subprocess.check_output(KUBE + ["get", "pods", "-l", "app=crawling-server", "-o", "name"], text=True).split()[0]
    end = last_sun + dt.timedelta(days=1)
    out = json.loads(subprocess.check_output(KUBE + ["exec", pod, "--", "node", "-e", DB_JS, str(start), str(end)], text=True))
    return ({r["wk"]: r for r in out["cohort"]}, {r["wk"]: int(r["recv"]) for r in out["recv"]},
            {r["wk"]: r for r in out["guest"]})


def pct(n, d):
    return f"{n:,} ({n / d:.0%})" if d else f"{n:,}"


g = ga4()
cohort, recv, guests = db()
lines = [f"# 지름알림 주간 깔때기 ({start} ~ {last_sun}, 생성 {today})", "",
         "★ = 알림 경유 재방문(오카방 유입 + 푸시 열기, 중복 가능). 가입 코호트는 그 주 가입자 기준, "
         "첫알림7일은 마지막 주가 아직 덜 찼다.", "",
         "| 주 | 상세 조회 | 알림 권유 클릭 | 게스트 등록(토큰) | 가입 | 키워드 등록 | 토큰 있음 | 첫 알림(7일) | 푸시 수신 | 오카방 유입 | 푸시 열기 | ★ |",
         "|---|---|---|---|---|---|---|---|---|---|---|---|"]
star = {}
for w in weeks:
    c = cohort.get(w, {})
    su, kw, tok, p7 = (int(c.get(k) or 0) for k in ("signup", "kw", "tok", "push7"))
    star[w] = g["kakao"].get(w, 0) + g["pushopen"].get(w, 0)
    det = g["detail"].get(w, 0)
    gu = guests.get(w, {})
    gcell = f"{int(gu.get('guest') or 0)} ({int(gu.get('gtok') or 0)})"
    lines.append(f"| {w[:4]}-W{w[4:]} | {det:,} | {pct(g['prompt'].get(w, 0), det)} | {gcell} | {su} | {pct(kw, su)} | "
                 f"{pct(tok, su)} | {pct(p7, su)} | {recv.get(w, 0):,} | {g['kakao'].get(w, 0):,} | "
                 f"{g['pushopen'].get(w, 0):,} | **{star[w]:,}** |")
report = "\n".join(lines) + "\n"
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as f:
    f.write(report)
print(report)

cur, prev = star[weeks[-1]], star[weeks[-2]] if WEEKS > 1 else 0
msg = f"알림 경유 재방문 {cur:,}명 (전주 {prev:,}) — {OUT}"
subprocess.run(["osascript", "-e", f'display notification "{msg}" with title "지름알림 주간 깔때기"'], check=False)
