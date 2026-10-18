# 카톡방 인원 기록

카톡 오픈채팅방(핫딜 온리방 `gJZTWAAg`, 핫딜 전체방 `gwexV0zg`)의 인원을 하루 두 번 남긴다. 카톡방 권유 실험(첫 방문 A/B·직행)을
클릭이 아니라 실제 입장(인원 순증)으로 판정하려는 것이다.

- 읽기: 맥 스튜디오(발송봇이 도는 맥)의 카톡 앱 창 머리 「대화상대 N명」을 `axcount`(접근성 API 직접, 0.6초)로 읽는다.
  System Events 를 거치지 않아 발송봇과 부딪히지 않는다(2026-10-16~, 없으면 옛 `read-room-counts.applescript`).
  빌드: 맥 스튜디오에서 `cd ~/jirum-kakao-room && swiftc -O axcount.swift -o axcount`.
  카카오 공개 페이지·검색 API·링크 API 에는 인원이 없다(2026-10-12 확인).
- 실행: 맥북 launchd `com.seonkyo.jirum-kakao-room`(09:00·21:00) → `ssh user@192.168.99.71 ~/jirum-kakao-room/record.sh`.
  맥북이 꺼져 있던 회차는 깨어날 때 한 번 돈다.
- 저장: 맥 스튜디오 `~/jirum-kakao-room/counts.csv`. 주간 깔때기(`scripts/funnel-weekly.py`)가 ssh 로 읽는다.

⚠️ 맥 스튜디오 cron 에서 돌리지 말 것. cron 의 osascript 는 접근성 권한을 기다리며 멈춰 System Events 를 붙잡고,
그 사이 발송봇(같은 System Events 로 카톡 창을 연다)이 못 보낸다 — 2026-10-12 시험 때 3분간 발송이 밀렸다(큐에 남아 유실은 없음).

배포(맥 스튜디오): `scp read-room-counts.applescript record.sh record-10m.sh axcount.swift user@192.168.99.71:jirum-kakao-room/` 후 위 빌드.

## 10분 표본 — 입장·퇴장 하한 (2026-10-16~)

방은 입장 메시지를 숨겨 대화 목록에 «들어왔습니다» 줄이 없고(10/16 확인), 대화상대 목록은 클릭해야 열려 발송봇과 부딪힌다.
그래서 인원을 10분마다 찍어 늘어난 수의 합을 입장, 줄어든 수의 합을 퇴장으로 센다(같은 10분에 겹치면 덜 센다 — 하한).

- 실행: 맥북 launchd `com.seonkyo.jirum-kakao-room-10m`(600초, `~/.local/bin/jirum-kakao-room-record-10m`) → ssh `record-10m.sh`.
- 저장: 맥 스튜디오 `~/jirum-kakao-room/counts-10m.csv`(온리방·전체방).
- 쓰임: `scripts/growth-snapshot.py` 의 `room_flow()` 가 주별 입장·퇴장·표본 시간(이웃 표본 20분 안만)을 formula.json 에 넣고,
  그로스 대시보드 «방 실측 이탈률»이 퇴장 ÷ 인원으로 단골 이탈률을 쿠키 대신 잰다. 맥북이 잠든 시간은 세지 않는다.

## Grafana 적재 (2026-10-18~)

- `ingest-metrics.py` — 두 CSV 를 날짜(KST)×방별 `kakao_room_members`·`kakao_room_joins`·`kakao_room_leaves`·`kakao_room_cover_h` 로 묶어
  운영 MySQL `business_metric_daily` 에 덮어쓴다(최근 3일, 인자로 일수). 정의는 `growth-snapshot.py` 의 `room_flow()` 와 같다.
- 실행: 맥북 launchd `com.seonkyo.jirum-kakao-room-ingest`(매시, `~/.local/bin/jirum-kakao-room-ingest`, kubectl prod 로 mysql-0 에 넣는다).
  클러스터 배치는 맥 스튜디오 CSV 에 닿지 않아서 맥북이 넣는다. 설치: `install -m 0755 scripts/kakao-room/ingest-metrics.py ~/.local/bin/jirum-kakao-room-ingest`.
- 보는 곳: Grafana «지름알람 - 비즈니스» «💬 카톡방» 줄.
