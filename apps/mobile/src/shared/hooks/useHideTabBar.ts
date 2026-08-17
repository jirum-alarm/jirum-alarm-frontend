import {useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  setTabBarVisible,
  useTabBarVisibility,
} from '@/shared/hooks/useTabBarVisibility';
import {
  getTabBarClipPx,
  isIos26SystemTabBar,
} from '@/navigations/tab/tab-bar-metrics';

/**
 * 지금 살아있는 "탭바를 숨기는 화면" 수.
 *
 * ★ boolean 으로는 안 된다: 화면 A → B 이동의 실행 순서가
 * (B focus) → (A cleanup) 이라 A 의 cleanup 이 B 가 세운 값을 지운다.
 * 카운터면 1 이 남아 정확하다.
 */
const hideCount = {current: 0};

/**
 * 이 화면에 있는 동안 탭바를 숨긴다.
 *
 * 탭바가 떠야 할 곳 / 안 떠야 할 곳:
 * - TabRoot(탭 웹뷰) → 떠야 함. TabWebView 가 URL 로 판단한다(isTabRootUrl).
 * - ProductDetail   → 안 떠야 함. 찜/구매 CTA 가 탭바를 대신한다.
 * - ProductComments → 안 떠야 함. 하단 입력창을 덮는다.
 * - Search          → 안 떠야 함. 검색·검색 결과 모두 이 화면이다.
 * - 상세 하위 웹뷰  → 안 떠야 함. 웹 페이지 자체 하단 UI 와 겹친다.
 *
 * 상세 → 댓글처럼 숨기는 화면끼리 이동할 때 중간에 탭바가 번쩍이지 않도록
 * 카운터로 관리하고, 마지막 화면이 빠질 때만 되돌린다.
 */
/**
 * 이 화면에 있는 동안 탭바를 **보인다**(탭 루트용).
 *
 * ★`setTabBarVisible(true)` 를 직접 부르면 안 된다 — hideCount 를 무시해서
 * 숨김 화면과 상태가 어긋난다. 홈이 그렇게 했더니 홈에서 탭바가 안 보이고
 * 상세 하단이 밀리는 증상이 났다(사용자 지적).
 *
 * 카운터가 0 일 때만(=숨기는 화면이 하나도 없을 때만) 켠다.
 */
export function useShowTabBar() {
  useFocusEffect(
    useCallback(() => {
      // 다른 화면의 cleanup 이 아직 안 돌았을 수 있어 한 틱 뒤에 판단한다.
      const timer = setTimeout(() => {
        if (hideCount.current === 0) setTabBarVisible(true);
      }, 0);
      return () => clearTimeout(timer);
    }, []),
  );
}

export function useHideTabBar(enabled = true) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      hideCount.current += 1;
      setTabBarVisible(false);

      return () => {
        hideCount.current = Math.max(0, hideCount.current - 1);
        // 다음 화면의 focus 가 먼저 돌 수 있으므로 한 틱 뒤에 판단한다.
        setTimeout(() => {
          if (hideCount.current === 0) setTabBarVisible(true);
        }, 0);
      };
    }, [enabled]),
  );
}

/**
 * iOS 26 네이티브 탭바를 숨길 때 화면 하단이 잘린다.
 * 그 잘린 높이만큼 콘텐츠를 올려야 찜/구매·댓글 입력이 안 사라진다.
 *
 * ★`createNativeBottomTabNavigator` 의 clipPx 와 **조건까지** 같아야 한다.
 * 거기선 `display:none && tabBarClipWhenHidden` 일 때만 자르는데, 이 훅이
 * `!tabBarVisible` 만 보면 실제로 안 자른 상태에도 패딩을 줘서 CTA 가
 * 98px 아래로 밀린다(사용자 지적: "상세 하단이 너무 아래에 박혀있다").
 *
 * hideCount 로 판단한다 — 숨기는 화면이 살아 있을 때만(=내비게이터가 clip 을
 * 켠 상태일 때만) 패딩을 준다. 진입 순간의 여백 점프도 같이 사라진다.
 */
export function useHiddenTabBarClipPadding() {
  const insets = useSafeAreaInsets();
  const tabBarVisible = useTabBarVisibility();
  if (!isIos26SystemTabBar()) return 0;
  // 탭바가 보이거나, 숨기는 화면이 하나도 없으면 clip 이 안 걸려 있다.
  if (tabBarVisible || hideCount.current === 0) return 0;
  return getTabBarClipPx(insets.bottom);
}
