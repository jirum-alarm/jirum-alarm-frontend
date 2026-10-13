#!/bin/zsh
# 지름알림 카톡 오픈채팅방 인원 기록 — 맥 스튜디오 ~/jirum-kakao-room/ 에 두고, 맥북 launchd 가 ssh 로 하루 두 번 부른다
# (scripts/kakao-room/README.md). 정본 CSV: 맥 스튜디오 ~/jirum-kakao-room/counts.csv (at,room,members).
#
# 왜: 방 인원은 카카오 API·공개 페이지 어디에도 없다(2026-10-12 확인). 이 맥의 카톡 앱(발송봇이 쓰는 것) 창 머리
# 「대화상대 N명」을 접근성으로 읽는 게 유일한 자동 경로다. 읽기만 하고 창 포커스를 건드리지 않는다.
# ⚠️ 맥 스튜디오 cron 으로 돌리지 말 것 — cron 의 osascript 는 접근성 권한 대기로 멈춰 System Events 를 붙잡았고,
#    같은 System Events 로 카톡 창을 여는 발송봇이 3분간 못 보냈다(2026-10-12). ssh 세션은 권한이 있다.

# 비대화형 실행은 LANG 이 비어 한글 방 이름이 깨진 채 osascript 로 간다(10/12 실측) — UTF-8 을 박는다.
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8
DIR="$HOME/jirum-kakao-room"
CSV="$DIR/counts.csv"
[ -f "$CSV" ] || print "at,room,members" > "$CSV"
now=$(date '+%Y-%m-%dT%H:%M:%S%z')
# 방 이름 = 이 맥 카톡의 창 제목(핫딜 온리방 = open.kakao.com/o/gJZTWAAg, 핫딜 전체방 = gwexV0zg, 핫딜 뷰티방 = pQ6ZAhSi).
osascript "$DIR/read-room-counts.applescript" "핫딜 온리방" "핫딜 전체방" "핫딜 뷰티방" | while IFS=$'\t' read -r room raw; do
  [ -z "$room" ] && continue
  n=$(print -r -- "$raw" | tr -dc '0-9')
  print "$now,$room,${n:-NA}" >> "$CSV"
done
