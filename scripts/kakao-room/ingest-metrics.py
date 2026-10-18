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
"""
import datetime as dt
import subprocess
import sys

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
