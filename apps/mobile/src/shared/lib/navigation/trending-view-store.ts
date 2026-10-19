import {useSyncExternalStore} from 'react';

/**
 * 발견 탭이 어느 화면(실시간·랭킹)을 보여줄지 — **view 의 정본**.
 *
 * ★ 왜 store 인가: 웹뷰 시절엔 홈의 "실시간 특가 더 보기"와 탭 재탭이
 * injectJavaScript 로 URL·스크롤을 밀어 넣었다. 네이티브 화면엔 주입할
 * 웹뷰가 없고, 탭바(MainTabNavigator)와 화면 사이에 부모-자식 관계도 없다.
 * useTabBarVisibility 와 같은 방식으로 밖에서 신호를 넣는다.
 *
 * ★ 화면이 없을 때 들어온 신호도 유지된다(값이 그냥 남는다) — 탭 전환보다
 * 신호가 먼저 도착하는 홈 CTA 경로에서 필요하다.
 */

export type TrendingView = 'live' | 'ranking';

/**
 * 신호가 한 번도 없을 때의 값. web /trending 이 /trending/live 로 리다이렉트하는 것과 같다.
 * ★탭바로 들어오는 경로는 이 값을 쓰지 않는다 — 다른 탭에서 발견 탭을 누르면
 * MainTabNavigator 가 'ranking' 을 요청한다(web 하단 네비가 /trending/ranking 으로 보낸다).
 */
let requestedView: TrendingView = 'live';
/**
 * 보고 있는 카테고리. web 은 `?tab=` 쿼리가 정본이다 — 앱은 URL 이 없어
 * 여기 둔다. 화면의 useState 로 두면 밖(커뮤니티 "'컴퓨터' 인기 상품 더보기" →
 * `/trending/ranking?tab=1`)에서 카테고리를 지정할 길이 없다.
 * 0 = '전체'(ALL_CATEGORY). 목록에 없는 id 는 화면이 '전체'로 떨어뜨린다.
 */
let requestedCategoryId = 0;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(listener => listener());
}

function getSnapshot() {
  return requestedView;
}

function getCategorySnapshot() {
  return requestedCategoryId;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 발견 탭을 이 화면으로 열어달라. (홈 CTA·다른 탭에서 진입) */
export function requestTrendingView(view: TrendingView) {
  requestedView = view;
  emitChange();
}

/**
 * 실시간 ↔ 랭킹 전환. 발견 탭을 **보고 있는 중에 다시 누르면** 이걸 부른다.
 *
 * ★ 화면의 useState 가 아니라 이 store 가 view 의 정본이다 — 둘로 나뉘어 있으면
 * "지금 무엇을 보고 있나"를 탭바가 알 수 없어 토글을 만들 수 없다.
 */
export function toggleTrendingView() {
  requestedView = requestedView === 'live' ? 'ranking' : 'live';
  emitChange();
}

/** 카테고리를 고른다. 칩 선택·딥링크(`?tab=N`) 공용. */
export function requestTrendingCategory(categoryId: number) {
  requestedCategoryId = categoryId;
  emitChange();
}

export function useTrendingView(): TrendingView {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useTrendingCategory(): number {
  return useSyncExternalStore(subscribe, getCategorySnapshot);
}
