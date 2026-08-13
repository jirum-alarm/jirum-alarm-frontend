import {useEffect, useRef} from 'react';

import {useAuth} from '@/shared/hooks/useAuth';
import {navigateToProductDetail} from '@/navigations/navigation-ref';
import {peekPendingAction} from '@/shared/lib/pending-action';
import {SERVICE_URL} from '@/constants/env';

/**
 * 로그인 직후, 남겨 둔 상세 경로로 돌아간다.
 * 동작 자체는 상세 화면의 usePendingAction 이 실행한다 — 여기서는 화면만 연다.
 */
export function PendingLoginRestore() {
  const {isLogin} = useAuth();
  const tried = useRef(false);

  useEffect(() => {
    if (!isLogin || tried.current) return;
    tried.current = true;

    peekPendingAction()
      .then(action => {
        if (!action?.returnPath) return;
        navigateToProductDetail(`${SERVICE_URL}${action.returnPath}`);
      })
      .catch(() => {});
  }, [isLogin]);

  return null;
}
