import React from 'react';
import messaging from '@react-native-firebase/messaging';
import {TokenType} from '../api/gql/graphql.ts';
import {useMutation} from '@tanstack/react-query';
import {NotificationService} from '../api/notification';
import {StorageKey} from '../constant/storage-key.ts';
import {setAsyncStorage} from '../lib/persistence';
import {waitForDeviceId} from '../lib/device/device-id';

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
          // X-Device-Id 없이 등록하면 서버가 deviceId=NULL 로 저장하고, 그 토큰은 기기 단위
          // 옛 토큰 회수에서 영구 제외돼 알림이 중복된다. 이 훅은 웹뷰의 DEVICE_ID_SYNC 보다
          // 먼저 뜨므로 첫 실행에서 실제로 그렇게 된다. 헤더가 붙을 때까지만 잠깐 기다린다.
          // (타임아웃되면 그대로 등록한다 — 중복 푸시보다 미등록이 더 큰 사고다.)
          await waitForDeviceId();
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
