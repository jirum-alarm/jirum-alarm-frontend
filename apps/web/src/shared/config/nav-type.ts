/** 웹 하단 탭 종류. BottomNav(widgets/layout)가 그리고 BasicLayout(shared)·페이지가 navType 으로 넘긴다 — 아래 레이어도 읽도록 shared 에 둔다. */
export enum NAV_TYPE {
  HOME = 'HOME',
  TRENDING = 'TRENDING',
  COMMUNITY = 'COMMUNITY',
  ALARM = 'ALARM',
  MYPAGE = 'MYPAGE',
}
