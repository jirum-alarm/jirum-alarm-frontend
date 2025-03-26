import { initializeApp } from 'firebase/app';
import { Unsubscribe, getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { firebaseConfig } from '@/constants/firebase';
import { httpClient } from '@/shared/lib/http-client';
import { fcmTokenAtom } from '@/state/fcmToken';

const firebaseApp = initializeApp(firebaseConfig);

const FCMConfig = () => {
  const setFcmToken = useSetRecoilState(fcmTokenAtom);
  const fcmToken = useRecoilValue(fcmTokenAtom);
  httpClient.setFcmToken(fcmToken);
  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    const retrieveToken = async () => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        // Retrieve the notification permission status
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const messaging = getMessaging(firebaseApp);
        getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        })
          .then((currentToken) => {
            if (currentToken) {
              setFcmToken(currentToken);
            } else {
              // Show permission request UI
              console.log('No registration token available. Request permission to generate one.');
            }
          })
          .catch((err) => {
            console.log('An error occurred while retrieving token. ', err);
          });
        unsubscribe = onMessage(messaging, (payload) => {
          console.log('Foreground : ', payload);
        });
      }
    };
    retrieveToken();
    return () => unsubscribe?.();
  }, []);

  return null;
};

export default FCMConfig;
