import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Unsubscribe } from 'firebase/messaging';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';

import { firebaseConfig } from '@/constants/firebase';
import { http } from '@/shared/lib/http';
import { fcmTokenAtom } from '@/state/fcmToken';

const firebaseApp = initializeApp(firebaseConfig);

const FCMConfig = () => {
  const setFcmToken = useSetAtom(fcmTokenAtom);
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
              http.setFcmToken(currentToken);
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
  }, [setFcmToken]);

  return null;
};

export default FCMConfig;
