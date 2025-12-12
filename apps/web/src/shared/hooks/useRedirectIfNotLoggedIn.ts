import { PAGE } from '@/constants/page';
import { useDevice } from '@/hooks/useDevice';
import useMyRouter from '@/hooks/useMyRouter';

import { WebViewBridge, WebViewEventType } from '../lib/webview';
import { WindowLocation } from '../lib/window-location';

import useIsLoggedIn from './useIsLoggedIn';

const useRedirectIfNotLoggedIn = () => {
  const router = useMyRouter();
  const { device } = useDevice();
  const { isLoggedIn } = useIsLoggedIn();

  const checkAndRedirect = () => {
    if (!isLoggedIn) {
      if (device.isJirumAlarmApp) {
        WebViewBridge.sendMessage(WebViewEventType.ROUTE_CHANGED, {
          data: { url: PAGE.LOGIN },
        });
      } else {
        router.push(PAGE.LOGIN + '?rtnUrl=' + encodeURIComponent(WindowLocation.getCurrentUrl()));
      }
      return true;
    }
    return false;
  };
  return { checkAndRedirect };
};

export default useRedirectIfNotLoggedIn;
