import { useAtom } from 'jotai';

import { PAGE } from '@/shared/config/page';
import { useDevice } from '@/shared/hooks/useDevice';

import { LoginModalMessage, loginModalMessageAtom } from '@/features/auth/model/login/loginModal';

import { WebViewBridge, WebViewEventType } from '../lib/webview';

import useIsLoggedIn from './useIsLoggedIn';

const DEFAULT_LOGIN_MESSAGE: LoginModalMessage = {
  title: '로그인이 필요해요',
  description: '로그인하고 지름알림의 다양한 기능을 이용해보세요',
};

/**
 * 앱 웹뷰는 네이티브 로그인 페이지로 라우팅, 웹은 로그인 모달을 연다(페이지 이동 없음).
 * message 는 모달에 뜨는 안내 문구 — 액션마다 다르게 넘길 수 있다.
 */
const useRedirectIfNotLoggedIn = () => {
  const { device } = useDevice();
  const { isLoggedIn } = useIsLoggedIn();
  const [, setLoginModalMessage] = useAtom(loginModalMessageAtom);

  const checkAndRedirect = (message: LoginModalMessage = DEFAULT_LOGIN_MESSAGE) => {
    if (!isLoggedIn) {
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
