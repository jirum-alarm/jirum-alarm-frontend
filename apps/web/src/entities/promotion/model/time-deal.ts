/**
 * 「선착순·타임특가」 섹션 id — 홈 섹션·더보기가 이 섹션에만 타이머를 단다.
 * ★'use client' 파일(TimeDealTimerBar)에 두면 서버 컴포넌트가 import 할 때 문자열이 아니라
 * 클라이언트 참조가 와서 `section.id === ...` 가 늘 거짓이었다(2026-10-15 실측) — 그래서 따로 둔다.
 */
export const TIME_DEAL_SECTION_ID = 'time-deal';
