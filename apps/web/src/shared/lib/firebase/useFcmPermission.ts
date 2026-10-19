'use client';

import { useCallback } from 'react';

import { setFcmToken as setFcmTokenAction } from '@/shared/actions/token';
import { TokenType } from '@/shared/api/gql/graphql';
import { NotificationService } from '@/shared/api/notification/notification.service';
import { firebaseConfig, webPushVapidKey } from '@/shared/config/firebase';

const COOLDOWN_KEY = 'fcm-permission-cooldown';
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
const PERMISSION_WAIT_MS = 8000;

const pushPermissionResult = (result: NotificationPermission | 'pending') =>
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event: 'push_permission_result',
    result,
  });

// firebase 는 사용자가 권한 프롬프트를 허용한 뒤에만 필요하다. 정적 import 면 이 훅을 쓰는
// 홈·상세·마이페이지 초기 번들에 전부 실린다 → 그 시점에 동적 import.
async function getMessagingLazy() {
  const [{ getApps, initializeApp }, { getMessaging, getToken }] = await Promise.all([
    import('firebase/app'),
    import('firebase/messaging'),
  ]);
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  return { messaging: getMessaging(app), getToken };
}

export function useFcmPermission() {
  // force: 유저가 "알림 켜기"를 직접 누른 경우 — 자동 프롬프트용 3일 쿨다운을 무시한다.
  const requestPermission = useCallback(async ({ force = false }: { force?: boolean } = {}) => {
    if (!('Notification' in window)) return { granted: false as const };

    // Cooldown for denied/ignored prompts
    const cooldown = localStorage.getItem(COOLDOWN_KEY);
    if (!force && cooldown && Date.now() - Number(cooldown) < COOLDOWN_MS) {
      return { granted: false as const };
    }

    const asked = Notification.requestPermission().then(async (permission) => {
      // 권유 클릭 뒤 실제로 켰는지 — 클릭만 재면 "알림 받는 사람"이 몇 명 늘었는지 모른다.
      pushPermissionResult(permission);
      if (permission !== 'granted') {
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
        return false;
      }

      const { messaging, getToken } = await getMessagingLazy();
      const vapidKey = webPushVapidKey();

      getToken(messaging, { vapidKey }).then((token) => {
        try {
          if (token) {
            // 쿠키 저장 및 서버 등록
            setFcmTokenAction(token);
            NotificationService.addPushToken({ token, tokenType: TokenType.Fcm });
          }
        } catch (e) {
          console.error('FCM getToken error', e);
        }
      });
      return true;
    });

    // 조용한 권한 요청(Edge 기본값·크롬 자동 전환)은 창 없이 주소창 아이콘만 띄우고, 사용자가 그걸
    // 누를 때까지 promise 가 끝나지 않는다 → 기다리던 화면이 멈춰 「어디로 받을까요」로도 못 넘어간다.
    // 2026-10-15 실측(10/12~ 웹 키워드 등록자): Edge 23명 중 권한 결과 6·Android 웨일 23명 중 0.
    // 기다리기를 접어도 요청은 살아 있어서, 나중에 허용하면 위 then 이 토큰을 그대로 등록한다.
    const granted = await Promise.race([
      asked,
      new Promise<'pending'>((resolve) => setTimeout(() => resolve('pending'), PERMISSION_WAIT_MS)),
    ]);
    if (granted === 'pending') {
      pushPermissionResult('pending');
      return { granted: false as const };
    }
    return granted ? { granted: true as const } : { granted: false as const };
  }, []);

  return { requestPermission };
}
