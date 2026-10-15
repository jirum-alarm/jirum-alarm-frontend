#!/bin/zsh
# 카톡방 인원 10분 표본 — 맥 스튜디오 ~/jirum-kakao-room/ 에 두고, 맥북 launchd com.seonkyo.jirum-kakao-room-10m 이 ssh 로 10분마다 부른다.
# 왜: 방 인원은 순증만 보이고(입장 메시지는 방에서 숨겨져 있다 — 대화 목록에 «들어왔습니다» 줄이 없다, 2026-10-16 확인)
# 대화상대 목록은 클릭해야 열려 발송봇과 부딪힌다. 10분마다 인원을 찍으면 입장·퇴장이 같은 10분에 겹치는 일이 드물어
# 늘어난 수의 합 ≈ 입장, 줄어든 수의 합 ≈ 퇴장이 된다(겹치면 둘 다 덜 센다 — 하한). 읽기는 axcount(0.6초, System Events 안 씀).
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8
DIR="$HOME/jirum-kakao-room"
CSV="$DIR/counts-10m.csv"
[ -f "$CSV" ] || print "at,room,members" > "$CSV"
now=$(date '+%Y-%m-%dT%H:%M:%S%z')
"$DIR/axcount" "핫딜 온리방" "핫딜 전체방" | while IFS=$'\t' read -r room n; do
  [ -z "$room" ] && continue
  print "$now,$room,$n" >> "$CSV"
done
