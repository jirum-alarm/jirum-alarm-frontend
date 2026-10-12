-- 카톡 오픈채팅방 인원 읽기(읽기 전용 — 창 포커스·클릭 없음, 발송봇과 안 부딪힌다).
-- ⚠️ SSH 로만 부른다. cron 에서 부르면 접근성 권한 대기로 System Events 가 멈춰 발송봇이 3분간 못 보냈다(2026-10-12).
-- 방 창 머리의 「대화상대 N명」 버튼 이름을 접근성으로 읽는다. 결과: 방이름<TAB>숫자 줄들(창이 없으면 NA).
on run argv
  set out to ""
  -- System Events 를 오래 붙잡지 않는다 — 발송봇이 같은 System Events 로 창을 연다.
  with timeout of 10 seconds
  tell application "System Events"
    tell process "KakaoTalk"
      repeat with roomName in argv
        set cnt to "NA"
        try
          set w to window (roomName as text)
          repeat with e in (buttons of w)
            set n to name of e
            if n is not missing value and n starts with "대화상대" then
              set cnt to n
              exit repeat
            end if
          end repeat
        end try
        set out to out & roomName & tab & cnt & linefeed
      end repeat
    end tell
  end tell
  end timeout
  return out
end run
