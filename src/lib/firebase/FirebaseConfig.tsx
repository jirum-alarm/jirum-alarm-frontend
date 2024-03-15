import { useEffect } from 'react';
import { Unsubscribe, getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/constants/firebase';
const firebaseApp = initializeApp(firebaseConfig);

const FirebaseConfig = () => {
  useEffect(() => {
    let unsubscribe: Unsubscribe;
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
              console.log('currentToken:', currentToken);
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
    return () => unsubscribe();
  }, []);

  return null;
};

export default FirebaseConfig;
