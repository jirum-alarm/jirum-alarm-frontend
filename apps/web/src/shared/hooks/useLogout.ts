import { getFcmToken, removeAccessToken, removeRefreshToken } from '@/app/actions/token';

import { NotificationService } from '@/shared/api/notification/notification.service';
import { PAGE } from '@/shared/config/page';
import { WebViewBridge, WebViewEventType } from '@/shared/lib/webview';

/**
 * 이 브라우저의 푸시 토큰을 계정에서 뗀다 — 인증이 필요해서 토큰 삭제보다 먼저.
 * 서버는 푸시 토큰을 userId 에 묶어 두고 logout 뮤테이션은 이력만 남겨서, 떼지 않으면
 * 로그아웃한 브라우저로 이전 계정의 키워드 알림이 계속 간다. 실패해도 로그아웃은 진행한다.
 */
const unlinkPushToken = async () => {
  try {
    const token = await getFcmToken();
    if (token) await NotificationService.removeTokenLinkage({ token });
  } catch (e) {
    console.error('removeTokenLinkage failed', e);
  }
};

export const useLogout = () => {
  const logout = async () => {
    await unlinkPushToken();
    await removeRefreshToken();
    await removeAccessToken();
    WebViewBridge.sendMessage(WebViewEventType.TOKEN_REMOVE, null);
    window.location.replace(PAGE.HOME);
  };
  return logout;
};
