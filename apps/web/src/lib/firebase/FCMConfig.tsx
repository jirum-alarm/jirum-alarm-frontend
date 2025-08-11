'use client';

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Unsubscribe } from 'firebase/messaging';
import { useEffect } from 'react';

import { setFcmToken as setFcmTokenAction } from '@/app/actions/token';
import { firebaseConfig } from '@/constants/firebase';

const firebaseApp = initializeApp(firebaseConfig);

const FCMConfig = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let unsubscribe: Unsubscribe | null = null;

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
        });
      } catch (err) {
        console.log('FCM setup error: ', err);
      }
    };

    setupGranted();

    return () => unsubscribe?.();
  }, []);

  return null;
};

export default FCMConfig;
