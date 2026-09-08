import {useEffect} from 'react';

import {tabNavigations} from '@/shared/constant/navigations';

/**
 * 탭별 "맨 위로" 콜백 등록소.
 *
 * ★ 왜 store 인가: 웹뷰 시절 재탭은 `injectJavaScript("window.scrollTo(...)")`
 * 였다. 네이티브 화면엔 주입할 웹뷰가 없고(`getWebViewRef(tab)?.current?.` 가
 * optional chaining 으로 예외도 로그도 없이 조용히 no-op), 탭바
 * (MainTabNavigator)와 화면 사이엔 부모-자식 관계도 없어 ref 를 내려줄 수도
 * 없다. trending-view-store 와 같은 방식으로 밖에서 신호를 넣는다.
 *
 * ★ 다만 이건 값이 아니라 **콜백 등록**이라 useSyncExternalStore 가 필요 없다 —
 * 구독해서 다시 그릴 게 없고, 탭바가 부를 때 한 번 실행하면 끝이다.
 *
 * ★ 등록은 **탭당 하나**다. 탭 스택에 상세가 쌓여도 루트 화면은 마운트된
 * 상태로 남으니 콜백이 유지되고, 화면이 언마운트되면 지워진다.
 * (재탭이 스택이 깊을 때는 popToTop 이 먼저 가로채므로 — MainTabNavigator
 * onTabPress — 상세가 스크롤 요청을 받는 일은 없다.)
 */

type TabName = (typeof tabNavigations)[keyof typeof tabNavigations];

const callbacks = new Map<TabName, () => void>();

/**
 * 이 화면의 "맨 위로"를 자기 탭 이름으로 등록한다. 언마운트되면 해제.
 *
 * ponytail: fn 이 매 렌더 새 함수여도 그냥 다시 등록한다(cleanup 이 먼저
 * 돌아 지운 뒤 다시 넣으므로 결과가 같다). ref 로 감싸 안정화하는 건
 * 지금 쓰는 두 화면 모두 useCallback 이라 값어치가 없다.
 */
export function useRegisterScrollToTop(tabName: TabName, fn: () => void) {
  useEffect(() => {
    callbacks.set(tabName, fn);
    return () => {
      // 다른 화면이 이미 자리를 차지했으면 건드리지 않는다(언마운트 순서 역전).
      if (callbacks.get(tabName) === fn) callbacks.delete(tabName);
    };
  }, [tabName, fn]);
}

/**
 * 탭바가 부른다. 등록된 콜백이 있으면 실행하고 true —
 * false 면 부른 쪽이 웹뷰 주입으로 폴백한다(커뮤니티·내정보는 아직 웹뷰).
 */
export function scrollTabToTop(tabName: TabName): boolean {
  const fn = callbacks.get(tabName);
  if (!fn) return false;
  fn();
  return true;
}
