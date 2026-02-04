import { PAGE } from '@/shared/config/page';
import { useDevice } from '@/shared/hooks/useDevice';
import useMyRouter from '@/shared/hooks/useMyRouter';

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
          data: { url: PAGE.LOGIN, type: 'push' },
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
