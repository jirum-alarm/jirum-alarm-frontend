'use client';

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Unsubscribe } from 'firebase/messaging';
import { useEffect } from 'react';

import { setFcmToken as setFcmTokenAction } from '@/app/actions/token';

import { firebaseConfig } from '@/shared/config/firebase';

const firebaseApp = initializeApp(firebaseConfig);

const FCMConfig = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let unsubscribe: Unsubscribe | null = null;

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

        const messaging = getMessaging(firebaseApp);
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
