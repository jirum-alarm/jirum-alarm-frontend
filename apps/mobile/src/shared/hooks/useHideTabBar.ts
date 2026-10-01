import {setTabBarVisible} from '@/shared/hooks/useTabBarVisibility';

/**
 * 탭 루트 웹뷰가 URL 로 판단해 켜고 끈다(하위 URL 에선 웹 자체 하단 UI 와 겹쳐서 끈다).
 *
 * 예전엔 "탭바를 숨기는 화면" 카운터(useHideTabBar)와 맞물려 있었는데, 그런 화면(상세 등)은
 * 이제 탭 바깥 루트 스택에 있어 탭바째 덮으므로 카운터가 필요 없다(MainNavigator 주석).
 */
export function setTabBarVisibleFromUrl(visible: boolean) {
  setTabBarVisible(visible);
}

/**
 * iOS 26 네이티브 탭바를 숨길 때 잘리는 화면 하단을 되미는 패딩. **지금은 항상 0** 이다.
 *
 * ★`createNativeBottomTabNavigator` 의 clipPx 와 **조건까지** 같아야 한다(다르면 안 잘린 화면에
 * 패딩만 생겨 CTA 가 98px 아래로 밀린다 — 사용자 지적 이력). 그 조건은
 * `display:none && tabBarClipWhenHidden` 인데, 이제 clip 을 켜는 곳이 없다:
 * 탭 위에 쌓는 화면(상세·댓글·검색 등)은 탭 **바깥** 루트 스택이라 탭바를 숨기지 않고 덮고
 * (MainNavigator), 탭 루트는 clip 을 쓰지 않는다(TabStackNavigator). → 내비게이터가 자르는 일이 없다.
 *
 * ponytail: 호출부(하단 고정 UI 들)는 그대로 둔다 — 0 을 더할 뿐이다. clip 이 다시 필요해지면
 * 여기서 `!tabBarVisible && clip 켜짐` 일 때 getTabBarClipPx(insets.bottom) 를 돌려주면 된다.
 */
export function useHiddenTabBarClipPadding(): number {
  return 0;
}
