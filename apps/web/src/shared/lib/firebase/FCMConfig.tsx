'use client';

import { useEffect } from 'react';

import { setFcmToken as setFcmTokenAction } from '@/app/actions/token';

import { firebaseConfig } from '@/shared/config/firebase';

const FCMConfig = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let unsubscribe: (() => void) | null = null;

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'push_notification_clicked') {
        (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
          event: 'push_notification_clicked',
          push_title: event.data.push_title,
          push_body: event.data.push_body,
        });
      }
    };
    navigator.serviceWorker.addEventListener('message', handleSwMessage);

    const setupGranted = async () => {
      try {
        // 권한이 이미 허용된 경우에만 토큰 조회/구독
        if (Notification.permission !== 'granted') return;

        // firebase 는 이 분기에서만 필요하다. 정적 import 였을 땐 모든 페이지 초기 번들에 실려
        // 알림을 켠 적 없는 방문자도 매번 받았다(13KB gz).
        const [{ getApps, initializeApp }, { getMessaging, getToken, onMessage }] =
          await Promise.all([import('firebase/app'), import('firebase/messaging')]);
        const app = getApps()[0] ?? initializeApp(firebaseConfig);
        const messaging = getMessaging(app);
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        const token = await getToken(messaging, { vapidKey });
        if (token) {
          await setFcmTokenAction(token);
        }

        unsubscribe = onMessage(messaging, (payload) => {
          console.log('Foreground : ', payload);
          (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
            event: 'push_notification_received',
            push_title: payload.notification?.title,
            push_body: payload.notification?.body,
            push_state: 'foreground',
          });
        });
      } catch (err) {
        console.log('FCM setup error: ', err);
      }
    };

    setupGranted();

    return () => {
      unsubscribe?.();
      navigator.serviceWorker.removeEventListener('message', handleSwMessage);
    };
  }, []);

  return null;
};

export default FCMConfig;
