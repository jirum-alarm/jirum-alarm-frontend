import { useAtom } from 'jotai';

import { PAGE } from '@/shared/config/page';
import { useDevice } from '@/shared/hooks/useDevice';

import { LoginModalMessage, loginModalMessageAtom } from '@/features/auth/model/login/loginModal';
import { savePendingAction } from '@/features/auth/model/login/pendingAction';

import { WebViewBridge, WebViewEventType } from '../lib/webview';

import useIsLoggedIn from './useIsLoggedIn';

const DEFAULT_LOGIN_MESSAGE: LoginModalMessage = {
  title: '로그인이 필요해요',
  description: '로그인하고 지름알림의 다양한 기능을 이용해보세요',
};

/**
 * 앱 웹뷰는 네이티브 로그인 페이지로 라우팅, 웹은 로그인 모달을 연다(페이지 이동 없음).
 * message 는 모달에 뜨는 안내 문구 — 액션마다 다르게 넘길 수 있다.
 *
 * pendingAction 을 주면 로그인하고 돌아왔을 때 그 동작을 이어서 실행한다.
 * 소비하는 쪽은 usePendingAction(type, run) 을 같은 type 으로 부르면 된다.
 * 안 주면 기존처럼 로그인만 유도하고 끝난다(하위 호환).
 */
const useRedirectIfNotLoggedIn = () => {
  const { device } = useDevice();
  const { isLoggedIn } = useIsLoggedIn();
  const [, setLoginModalMessage] = useAtom(loginModalMessageAtom);

  const checkAndRedirect = (
    message: LoginModalMessage = DEFAULT_LOGIN_MESSAGE,
    pendingAction?: { type: string; payload?: unknown },
  ) => {
    if (!isLoggedIn) {
      // 로그인 경로는 모달이든 웹뷰든 결국 페이지를 떠난다. 하려던 동작을 저장해야
      // 돌아왔을 때 이어갈 수 있다.
      if (pendingAction) {
        savePendingAction(pendingAction.type, pendingAction.payload);
      }
      if (device.isJirumAlarmApp) {
        WebViewBridge.sendMessage(WebViewEventType.ROUTE_CHANGED, {
          data: { url: PAGE.LOGIN, type: 'push' },
        });
      } else {
        setLoginModalMessage(message);
      }
      return true;
    }
    return false;
  };
  return { checkAndRedirect };
};

export default useRedirectIfNotLoggedIn;
