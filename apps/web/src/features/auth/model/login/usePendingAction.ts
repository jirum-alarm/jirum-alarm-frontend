'use client';

import { useEffect, useRef } from 'react';

import useIsLoggedIn from '@/shared/hooks/useIsLoggedIn';

import { takePendingAction } from './pendingAction';

/**
 * 로그인하고 돌아왔을 때, 로그인 전에 하려던 동작을 이어서 실행한다.
 *
 * 액션을 거는 쪽(찜하기·키워드 등록 등)에서 이 훅을 같은 type 으로 부르면 된다.
 * 예) 홈 추천 칩:
 *   usePendingAction('notification-keyword-add', (keyword) => addKeyword(keyword))
 *
 * 주의: 저장된 의도는 takePendingAction 이 꺼내면서 지우므로 정확히 한 번만 실행된다.
 * 화면에 여러 소비자가 있어도 먼저 잡은 쪽이 가져간다 — type 을 겹치게 쓰지 말 것.
 */
export function usePendingAction<T = unknown>(type: string, run: (payload: T) => void) {
  const { isLoggedIn, isLoading } = useIsLoggedIn();
  // run 이 매 렌더 새 함수여도 effect 가 다시 돌지 않도록 최신 참조만 들고 있는다.
  const runRef = useRef(run);
  runRef.current = run;
  const consumed = useRef(false);

  useEffect(() => {
    // 로그인 판정이 끝나기 전에 꺼내면 비로그인으로 오인해 의도를 버리게 된다.
    if (isLoading || !isLoggedIn || consumed.current) return;

    const action = takePendingAction();
    if (!action) return;

    if (action.type !== type) {
      // 내 것이 아니면 도로 넣지 않는다 — 이 화면에 해당 소비자가 없다는 뜻이고,
      // 남겨두면 엉뚱한 화면에서 뒤늦게 실행될 수 있다.
      return;
    }

    consumed.current = true;
    runRef.current(action.payload as T);
  }, [isLoggedIn, isLoading, type]);
}
