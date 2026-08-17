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
 * ★탭바가 **실제로 숨은 뒤에만** 패딩을 준다.
 * useHideTabBar 는 useFocusEffect(포커스 후)에 도는데 이 훅이 첫 렌더부터
 * 패딩을 주면, 진입 순간 "탭바 보임 + 패딩 있음"이 겹쳐 하단에 98px 여백이
 * 생겼다가 탭바가 잘리면서 사라진다(사용자 지적: "여백이 있다가 사라진다").
 * 같은 신호(useTabBarVisibility)를 보면 둘이 항상 같은 프레임에 맞는다.
 */
export function useHiddenTabBarClipPadding() {
  const insets = useSafeAreaInsets();
  const tabBarVisible = useTabBarVisibility();
  if (!isIos26SystemTabBar()) return 0;
  if (tabBarVisible) return 0;
  return getTabBarClipPx(insets.bottom);
}
