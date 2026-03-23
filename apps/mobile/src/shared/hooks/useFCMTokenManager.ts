import React from 'react';
import messaging from '@react-native-firebase/messaging';
import {TokenType} from '../api/gql/graphql.ts';
import {useMutation} from '@tanstack/react-query';
import {NotificationService} from '../api/notification';
import {StorageKey} from '../constant/storage-key.ts';
import {setAsyncStorage} from '../lib/persistence';

const useFCMTokenManager = () => {
  const {mutate} = useMutation({
    mutationFn: NotificationService.addToken,
  });
  React.useEffect(() => {
    (async () => {
      try {
        const authorizationStatus = await messaging().requestPermission();

        const enabled =
          authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;
        await messaging().registerDeviceForRemoteMessages();

        if (enabled) {
          const token = await messaging().getToken();
          await setAsyncStorage(StorageKey.FCM_DEVICE_TOKEN, token);
          mutate({
            token,
            tokenType: TokenType.Fcm,
          });
        }
      } catch (error) {
        console.log('error:', error);
      }
    })();
  }, [mutate]);
};

export default useFCMTokenManager;
