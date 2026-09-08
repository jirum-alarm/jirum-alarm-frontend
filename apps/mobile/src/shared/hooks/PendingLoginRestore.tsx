import {useEffect, useRef} from 'react';

import {useAuth} from '@/shared/hooks/useAuth';
import {navigateToNativeRoute} from '@/navigations/navigation-ref';
import {peekPendingAction} from '@/shared/lib/pending-action';
import {SERVICE_URL} from '@/constants/env';

/**
 * 로그인 직후, 남겨 둔 경로로 돌아간다(대개 상품 상세).
 * 동작 자체는 상세 화면의 usePendingAction 이 실행한다 — 여기서는 화면만 연다.
 *
 * ★웹뷰 폴백은 켜지 않는다. 여기 오는 경로는 로그인을 요구한 네이티브 화면이
 * 남긴 것이라 네이티브에 대응 화면이 있다.
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
        navigateToNativeRoute(`${SERVICE_URL}${action.returnPath}`);
      })
      .catch(() => {});
  }, [isLogin]);

  return null;
}
