import {useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';

import {setTabBarVisible} from '@/shared/hooks/useTabBarVisibility';

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
 * - ProductDetail   → 안 떠야 함. 하단 CTA 를 덮는다.
 * - ProductComments → 안 떠야 함. 하단 입력창을 덮는다.
 *
 * 상세 → 댓글처럼 숨기는 화면끼리 이동할 때 중간에 탭바가 번쩍이지 않도록
 * 카운터로 관리하고, 마지막 화면이 빠질 때만 되돌린다.
 */
export function useHideTabBar() {
  useFocusEffect(
    useCallback(() => {
      hideCount.current += 1;
      setTabBarVisible(false);

      return () => {
        hideCount.current = Math.max(0, hideCount.current - 1);
        // 다음 화면의 focus 가 먼저 돌 수 있으므로 한 틱 뒤에 판단한다.
        setTimeout(() => {
          if (hideCount.current === 0) setTabBarVisible(true);
        }, 0);
      };
    }, []),
  );
}
