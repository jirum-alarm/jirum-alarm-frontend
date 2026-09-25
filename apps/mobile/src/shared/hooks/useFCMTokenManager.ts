import React from 'react';
import messaging from '@react-native-firebase/messaging';

import {registerFcmToken} from '../lib/fcm/push-permission';

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
  }, []);
};

export default useFCMTokenManager;
