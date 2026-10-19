#!/usr/bin/env python3
"""카톡방 인원 기록 → 운영 MySQL business_metric_daily (Grafana «지름알람 - 비즈니스», 2026-10-18).

맥 스튜디오 counts.csv(하루 2회)·counts-10m.csv(10분)를 ssh 로 읽어 날짜(KST)×방별로 넣는다.
- kakao_room_members  그날 마지막 인원
- kakao_room_joins / kakao_room_leaves  10분 표본에서 이웃 표본이 20분 안일 때 늘어난 수·줄어든 수의 합(하한)
- kakao_room_cover_h  그날 그렇게 덮은 시간 — 맥북이 잠든 동안은 표본이 없어 입장·퇴장이 덜 잡힌다. 판독은 이 시간과 같이.
정의는 scripts/growth-snapshot.py 의 room_flow() 와 같다.

클러스터 안 배치(snapshot_business_metrics)는 맥 스튜디오 CSV 에 닿지 않아 맥북 launchd 가 대신 넣는다
(com.seonkyo.jirum-kakao-room-ingest, 매시). 배치는 자기 지표만 지우고 다시 쓰므로 이 kakao_room_* 칸은 건드리지 않는다.
최근 DAYS 일을 매번 덮어쓴다(멱등). 설치: install -m 0755 scripts/kakao-room/ingest-metrics.py ~/.local/bin/jirum-kakao-room-ingest

정원 알림(2026-10-19): 온리방이 정원(1,500)의 90% 에 닿으면 Mattermost 로 한 통(7일에 한 번) — 아래 capacity_alert.
"""
import base64
import datetime as dt
import json
import os
import subprocess
import sys
import urllib.request

DAYS = int(sys.argv[1]) if len(sys.argv) > 1 else 3
HOST = "user@192.168.99.71"
KUBE = ["kubectl", "--context", "prod", "-n", "crawling-server", "exec", "-i", "mysql-0", "--"]
ROOMS = {"핫딜 온리방": "hotdeal_only", "핫딜 전체방": "hotdeal_all"}
KST = dt.timezone(dt.timedelta(hours=9))


def read(path):
    out = subprocess.check_output(["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", HOST, f"cat {path}"],
                                  text=True, timeout=60)
    pts = []
    for line in out.splitlines()[1:]:
        at, room, members = (line.split(",") + ["", "", ""])[:3]
        if room in ROOMS and members.isdigit():
            t = dt.datetime.strptime(at, "%Y-%m-%dT%H:%M:%S%z").astimezone(KST)
            pts.append((ROOMS[room], t, int(members)))
    return pts


since = dt.datetime.now(KST).date() - dt.timedelta(days=DAYS - 1)
rows = {}  # (date, metric, dim) -> value


def put(day, metric, dim, value):
    if day >= since:
        rows[(str(day), metric, dim)] = value


twice, tenmin = read("~/jirum-kakao-room/counts.csv"), read("~/jirum-kakao-room/counts-10m.csv")
for room, t, m in sorted(twice + tenmin, key=lambda p: p[1]):  # 늦은 표본이 덮어써 그날 마지막 인원이 남는다
    put(t.date(), "kakao_room_members", room, m)

for room in ROOMS.values():
    pts = sorted((t, m) for r, t, m in tenmin if r == room)
    flow = {}
    for (t0, m0), (t1, m1) in zip(pts, pts[1:]):
        gap = (t1 - t0).total_seconds()
        if gap > 20 * 60:
            continue
        f = flow.setdefault(t1.date(), [0, 0, 0.0])
        f[0] += max(0, m1 - m0)
        f[1] += max(0, m0 - m1)
        f[2] += gap / 3600
    for day, (joins, leaves, cover) in flow.items():
        put(day, "kakao_room_joins", room, joins)
        put(day, "kakao_room_leaves", room, leaves)
        put(day, "kakao_room_cover_h", room, round(cover, 2))

if not rows:
    sys.exit("표본 없음 — 맥 스튜디오 CSV 확인")
values = ",".join(f"('{d}','{m}','{r}',{v})" for (d, m, r), v in sorted(rows.items()))
sql = ("INSERT INTO business_metric_daily (date, metric, dim, value) VALUES " + values +
       " ON DUPLICATE KEY UPDATE value = VALUES(value);")
# 값은 전부 위에서 만든 날짜·고정 이름·숫자라 따옴표가 섞일 일이 없다.
subprocess.run(KUBE + ["bash", "-c", 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -D crawling 2>/dev/null'],
               input=sql, text=True, check=True, timeout=60)
print(f"{dt.datetime.now(KST):%F %T} {len(rows)}칸 ({since}~)")

# 정원 알림 — 온리방(카톡 수익의 ~83%)이 차면 새 사람이 못 들어와 순증이 조용히 0 이 된다. 방 설정 «최대 인원 수» 1,500 은
# 사용자 확인(2026-10-19, 910명·주 +23 → ~25주 여유). 90% 에서 알려 2호방을 열 시간을 번다(설계안 vault domain/kakao-to-app-bridge.md).
# 웹훅은 파일에 두지 않고 운영 클러스터 시크릿(seo-watch — Infisical /common MATTERMOST_WEBHOOK_URL 사본)에서 그때 읽는다.
# 시험: KAKAO_ROOM_CAPACITY_ALERT_AT=1 KAKAO_ROOM_ALERT_DRY=1 python3 ingest-metrics.py 1  (보내지 않고 문구만)
CAPACITY = 1500
ALERT_AT = int(os.environ.get("KAKAO_ROOM_CAPACITY_ALERT_AT", CAPACITY * 9 // 10))
ALERT_STATE = os.path.expanduser("~/.local/share/jirum/kakao-room-capacity-alerted")


def capacity_alert(pts):
    only = sorted((t, m) for r, t, m in pts if r == "hotdeal_only")
    if not only or only[-1][1] < ALERT_AT:
        return None
    now_t, now_m = only[-1]
    # 순증 속도 = 7~28일 전 가장 오래된 표본부터 지금까지(기록이 4주가 안 돼도 1주만 있으면 잰다).
    span = [(t, m) for t, m in only if now_t - dt.timedelta(days=28) <= t <= now_t - dt.timedelta(days=7)]
    weekly = (now_m - span[0][1]) / ((now_t - span[0][0]).total_seconds() / 604800) if span else 0
    eta = f" · 최근 순증 주당 {weekly:.0f}명이면 ~{(CAPACITY - now_m) / weekly:.0f}주 뒤 가득" if weekly > 0 else ""
    return (f":busts_in_silhouette: **kakao-room** — 핫딜 온리방 {now_m:,}명 / 정원 {CAPACITY:,}({now_m * 100 // CAPACITY}%){eta}. "
            "차면 새 사람이 못 들어온다 — 2호방 설계안: jirum vault domain/kakao-to-app-bridge.md §2026-10-19.")


text = capacity_alert(twice + tenmin)
if text:
    today = dt.datetime.now(KST).date()
    last = open(ALERT_STATE).read().strip() if os.path.exists(ALERT_STATE) else ""
    if os.environ.get("KAKAO_ROOM_ALERT_DRY"):
        print(text)
    elif not last or today - dt.date.fromisoformat(last) >= dt.timedelta(days=7):
        hook = subprocess.check_output(["kubectl", "--context", "prod", "-n", "seo-watch", "get", "secret", "seo-watch",
                                        "-o", "jsonpath={.data.mattermost-webhook-url}"], text=True, timeout=30)
        req = urllib.request.Request(base64.b64decode(hook).decode(), headers={"content-type": "application/json"},
                                     data=json.dumps({"username": "kakao-room", "text": text}).encode())
        with urllib.request.urlopen(req, timeout=30) as r:
            print("정원 알림", r.status)
        with open(ALERT_STATE, "w") as f:
            f.write(str(today))
