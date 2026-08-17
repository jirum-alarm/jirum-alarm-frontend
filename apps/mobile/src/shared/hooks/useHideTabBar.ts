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

function setHideCount(next: number) {
  hideCount.current = Math.max(0, next);
}

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
 * 탭 루트 웹뷰가 URL 로 판단해 켜고 끌 때 쓴다.
 *
 * ★`setTabBarVisible` 을 직접 부르면 hideCount 를 무시한다. 숨김 화면이
 * 살아 있는데 웹뷰가 켜버리거나, 반대로 웹뷰가 꺼둔 걸 아무도 못 되돌린다
 * (더보기 웹뷰 → 홈 복귀 시 탭바가 안 돌아오던 원인).
 */
export function setTabBarVisibleFromUrl(visible: boolean) {
  if (!visible) {
    setTabBarVisible(false);
    return;
  }
  // 켜는 건 숨기는 화면이 하나도 없을 때만.
  if (hideCount.current === 0) setTabBarVisible(true);
}

export function useHideTabBar(enabled = true) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      setHideCount(hideCount.current + 1);
      setTabBarVisible(false);

      return () => {
        setHideCount(hideCount.current - 1);
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
  // ★탭바가 숨겨졌으면 곧 clip 도 걸린다 — 이 값 하나만 본다.
  //
  // 예전엔 hideCount 도 함께 봤는데, 라우트 기반으로 바꾸면서 네이티브 상세가
  // useHideTabBar 를 안 쓰게 됐다 → hideCount 가 늘 0 이라 패딩이 영영 0.
  // 그 상태에서 tabBarVisible 만 뒤늦게 false 가 되니 값이 한 번 흔들려
  // "여백이 생겼다 사라지는" 것처럼 보였다(사용자 지적).
  //
  // 내비게이터도 같은 tabBarStyle.display 로 자르므로 신호가 일치한다.
  const tabBarVisible = useTabBarVisibility();

  if (!isIos26SystemTabBar()) return 0;
  if (tabBarVisible) return 0;
  return getTabBarClipPx(insets.bottom);
}
