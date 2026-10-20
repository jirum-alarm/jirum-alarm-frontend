// 하네스가 찍는 화면 목록. 새 화면을 만들거나 자주 깨지는 화면이 생기면 여기 한 줄 + `screens:record` 로 데이터를 다시 녹화한다.
// id·키워드는 녹화 시점에 운영에 있던 값 — 바꾸면 다시 녹화해야 한다.
export type ScreenPage = {
  name: string;
  path: string;
  /** 빈 목록·에러 시나리오까지 찍을 화면(목록이 주인공인 화면). */
  states?: boolean;
  /** PC 레이아웃이 따로 있는 화면만 데스크톱도 찍는다((mobile) 그룹은 PC 에서도 같은 틀). */
  desktop?: boolean;
};

export const PRODUCT_ID = '36089133';
export const KEYWORD = '세제';

export const PAGES: ScreenPage[] = [
  { name: 'home', path: '/', states: true, desktop: true },
  { name: 'product-detail', path: `/products/${PRODUCT_ID}`, states: true, desktop: true },
  {
    name: 'search',
    path: `/search?keyword=${encodeURIComponent(KEYWORD)}`,
    states: true,
    desktop: true,
  },
  { name: 'keywords', path: '/keywords', states: true, desktop: true },
  {
    name: 'keyword-hub',
    path: `/keywords/${encodeURIComponent(KEYWORD)}`,
    states: true,
    desktop: true,
  },
  { name: 'trending-ranking', path: '/trending/ranking', states: true, desktop: true },
  { name: 'trending-live', path: '/trending/live', desktop: true },
  { name: 'deals', path: '/deals', states: true, desktop: true },
  { name: 'community', path: '/community', states: true, desktop: true },
  { name: 'themes', path: '/themes', desktop: true },
  { name: 'recommend', path: '/recommend', desktop: true },
  { name: 'mypage', path: '/mypage' },
  { name: 'alarm', path: '/alarm' },
  { name: 'login', path: '/login' },
];
