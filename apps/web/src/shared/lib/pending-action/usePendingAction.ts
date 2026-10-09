'use client';

import { useEffect, useEffectEvent, useRef } from 'react';

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
 * 같은 type 소비자가 한 화면에 여럿이면 먼저 잡은 쪽이 가져간다.
 */
export function usePendingAction<T = unknown>(type: string, run: (payload: T) => void) {
  const { isLoggedIn, isLoading } = useIsLoggedIn();
  // run 이 매 렌더 새 함수여도 effect 가 다시 돌지 않도록 Effect Event 로 최신 run 을 부른다.
  const runLatest = useEffectEvent((payload: T) => run(payload));
  const consumed = useRef(false);

  useEffect(() => {
    // 로그인 판정이 끝나기 전에 꺼내면 비로그인으로 오인해 의도를 버리게 된다.
    if (isLoading || !isLoggedIn || consumed.current) return;

    // 내 type 일 때만 꺼낸다 — 남의 것은 그 소비자를 위해 남겨 둔다(10분 만료).
    const action = takePendingAction(type);
    if (!action) return;

    consumed.current = true;
    runLatest(action.payload as T);
  }, [isLoggedIn, isLoading, type]);
}
