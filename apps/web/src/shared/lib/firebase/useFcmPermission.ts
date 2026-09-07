'use client';

import { useCallback } from 'react';

import { setFcmToken as setFcmTokenAction } from '@/app/actions/token';

import { TokenType } from '@/shared/api/gql/graphql';
import { NotificationService } from '@/shared/api/notification/notification.service';
import { firebaseConfig } from '@/shared/config/firebase';

const COOLDOWN_KEY = 'fcm-permission-cooldown';
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

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
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return { granted: false as const };

    // Cooldown for denied/ignored prompts
    const cooldown = localStorage.getItem(COOLDOWN_KEY);
    if (cooldown && Date.now() - Number(cooldown) < COOLDOWN_MS) {
      return { granted: false as const };
    }

    Notification.requestPermission().then(async (permission) => {
      if (permission !== 'granted') {
        localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
        return { granted: false as const };
      }

      const { messaging, getToken } = await getMessagingLazy();
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

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
    });
  }, []);

  return { requestPermission };
}
