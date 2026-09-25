import React from 'react';
import messaging from '@react-native-firebase/messaging';

import {
  registerFcmToken,
  saveAndRegisterFcmToken,
} from '../lib/fcm/push-permission';

const useFCMTokenManager = () => {
  React.useEffect(() => {
    (async () => {
      try {
        const authorizationStatus = await messaging().requestPermission();

        const enabled =
          authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          await registerFcmToken();
        } else {
          await messaging().registerDeviceForRemoteMessages();
        }
      } catch (error) {
        console.log('error:', error);
      }
    })();

    const unsubscribe = messaging().onTokenRefresh(token => {
      saveAndRegisterFcmToken(token).catch(error =>
        console.log('fcm token refresh error:', error),
      );
    });
    return unsubscribe;
  }, []);
};

export default useFCMTokenManager;
