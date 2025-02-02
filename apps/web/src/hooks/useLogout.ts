import { removeAccessToken, removeRefreshToken } from '@/app/actions/token';
import { PAGE } from '@/constants/page';
import { WebViewBridge, WebViewEventType } from '@/shared/lib/webview';

export const useLogout = () => {
  const logout = async () => {
    await removeRefreshToken();
    await removeAccessToken();
    WebViewBridge.sendMessage(WebViewEventType.TOKEN_REMOVE, null);
    window.location.replace(PAGE.HOME);
  };
  return logout;
};
