# 카톡방 인원 기록

카톡 오픈채팅방(핫딜 온리방 `gJZTWAAg`, 핫딜 전체방 `gwexV0zg`)의 인원을 하루 두 번 남긴다. 카톡방 권유 실험(첫 방문 A/B·직행)을
클릭이 아니라 실제 입장(인원 순증)으로 판정하려는 것이다.

- 읽기: 맥 스튜디오(발송봇이 도는 맥)의 카톡 앱 창 머리 「대화상대 N명」을 접근성(System Events)으로 읽는다.
  카카오 공개 페이지·검색 API·링크 API 에는 인원이 없다(2026-10-12 확인).
- 실행: 맥북 launchd `com.seonkyo.jirum-kakao-room`(09:00·21:00) → `ssh user@192.168.99.71 ~/jirum-kakao-room/record.sh`.
  맥북이 꺼져 있던 회차는 깨어날 때 한 번 돈다.
- 저장: 맥 스튜디오 `~/jirum-kakao-room/counts.csv`. 주간 깔때기(`scripts/funnel-weekly.py`)가 ssh 로 읽는다.

⚠️ 맥 스튜디오 cron 에서 돌리지 말 것. cron 의 osascript 는 접근성 권한을 기다리며 멈춰 System Events 를 붙잡고,
그 사이 발송봇(같은 System Events 로 카톡 창을 연다)이 못 보낸다 — 2026-10-12 시험 때 3분간 발송이 밀렸다(큐에 남아 유실은 없음).

배포(맥 스튜디오): `scp read-room-counts.applescript record.sh user@192.168.99.71:jirum-kakao-room/`
