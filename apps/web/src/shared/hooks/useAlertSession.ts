'use client';

import { useAtom } from 'jotai';

import { getFcmToken, setGuestSession } from '@/app/actions/token';

import { AuthService } from '@/shared/api/auth';
import { TokenType } from '@/shared/api/gql/graphql';
import { NotificationService } from '@/shared/api/notification/notification.service';
import { useDevice } from '@/shared/hooks/useDevice';
import useIsLoggedIn, { isGuestAtom } from '@/shared/hooks/useIsLoggedIn';
import useRedirectIfNotLoggedIn from '@/shared/hooks/useRedirectIfNotLoggedIn';

import type { LoginModalMessage } from '@/features/auth/model/login/loginModal';

/**
 * 키워드·관심사 알림 등록 전에 부른다. 로그인했으면 그대로, 아니면 게스트 계정을 만들어 바로 진행한다.
 *
 * 왜: 로그인 벽 앞에서 대부분 떠났다(가입자 83% 가 첫 방문 1시간 안 충동 가입, 나머지는 이탈).
 * 게스트는 기기 계정이라 그 기기에서 나중에 로그인하면 백엔드가 키워드를 그 계정으로 합친다.
 * 앱 웹뷰는 앱이 자기 로그인/게스트를 관리하므로 지금처럼 네이티브 로그인으로 보낸다.
 *
 * @returns 진행해도 되면 true. false 면 로그인 유도로 넘어갔다(pendingAction 저장됨).
 */
const useAlertSession = () => {
  const { isLoggedIn } = useIsLoggedIn();
  const [isGuest, setIsGuest] = useAtom(isGuestAtom);
  const { device } = useDevice();
  const { checkAndRedirect } = useRedirectIfNotLoggedIn();

  const ensureAlertSession = async (
    message?: LoginModalMessage,
    pendingAction?: { type: string; payload?: unknown },
  ): Promise<boolean> => {
    if (isLoggedIn) return true;
    if (device.isJirumAlarmApp) {
      checkAndRedirect(message, pendingAction);
      return false;
    }
    try {
      // 이미 게스트여도 다시 부른다 — 같은 기기면 같은 게스트를 주고, 1시간짜리 토큰이 갱신된다.
      const data = await AuthService.guestLogin();
      const deviceId = localStorage.getItem('jirum-alarm-device-id');
      if (!data?.guestLogin.accessToken || !deviceId) throw new Error('guestLogin failed');
      await setGuestSession(data.guestLogin.accessToken, deviceId);
      if (!isGuest) {
        setIsGuest(true);
        // 웹 푸시를 이미 허용했던 브라우저는 토큰이 비회원으로 등록돼 있다 → 게스트에 붙인다.
        const fcmToken = await getFcmToken();
        if (fcmToken) {
          NotificationService.addPushToken({ token: fcmToken, tokenType: TokenType.Fcm }).catch(
            () => undefined,
          );
        }
      }
      return true;
    } catch {
      // 게스트 발급이 안 되면 예전처럼 로그인으로 — 등록 의도는 pendingAction 으로 이어진다.
      checkAndRedirect(message, pendingAction);
      return false;
    }
  };

  return { ensureAlertSession, canUseAlerts: isLoggedIn || isGuest, isGuest };
};

export default useAlertSession;
