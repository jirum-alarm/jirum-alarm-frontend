import {useEffect, useRef} from 'react';

import {useAuth} from '@/shared/hooks/useAuth';
import {showToast} from '@/shared/lib/feedback';
import {
  savePendingAction,
  takePendingAction,
} from '@/shared/lib/pending-action';

/**
 * 로그인이 필요한 액션의 게이트.
 *
 * me() 로딩 중을 비로그인으로 보면 이미 들어온 사람이 토스트만 보고 막힌다.
 * 토큰 기준(useAuth)으로 보고, 정말 비로그인이면 의도를 저장해 복귀 후 이어간다.
 */
export function useRequireLogin(returnPath?: string) {
  const {isLogin, isLoading} = useAuth();

  const requireLogin = (type: string, payload?: unknown) => {
    if (isLoading) return true;
    if (isLogin) return false;
    savePendingAction(type, payload, returnPath).catch(() => {});
    showToast.info('로그인 후 이용해주세요.');
    return true;
  };

  return {requireLogin, isLogin};
}

/**
 * 로그인하고 돌아왔을 때, 같은 type 의 동작을 한 번만 이어서 실행한다.
 */
export function usePendingAction<T = unknown>(
  type: string,
  run: (payload: T) => void,
  enabled = true,
) {
  const {isLogin, isLoading} = useAuth();
  const runRef = useRef(run);
  runRef.current = run;
  const consumed = useRef(false);

  useEffect(() => {
    if (isLoading || !isLogin || !enabled || consumed.current) return;

    takePendingAction(type)
      .then(action => {
        if (!action) return;
        consumed.current = true;
        runRef.current(action.payload as T);
      })
      .catch(() => {});
  }, [isLogin, isLoading, type, enabled]);
}
