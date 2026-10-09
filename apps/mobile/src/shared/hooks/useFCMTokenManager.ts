import React from 'react';
import {
  AuthorizationStatus,
  getMessaging,
  hasPermission,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';

import {
  registerFcmToken,
  saveAndRegisterFcmToken,
} from '../lib/fcm/push-permission';

const useFCMTokenManager = () => {
  React.useEffect(() => {
    const messaging = getMessaging();
    (async () => {
      try {
        // ★앱 진입 때는 **묻지 않고 확인만** 한다. 예전엔 여기서 requestPermission 을 불러
        // 처음 켜자마자 로그인 화면 위에 맥락 없는 OS 팝업이 떴다 — 거기서 거절하면 핵심
        // 가치(키워드 알림)가 죽는다. 묻는 건 로그인 뒤 안내 시트(PushPermissionPrePrompt)와
        // 키워드 등록 직후(requestPushPermissionIfNeeded)가 맡는다.
        const authorizationStatus = await hasPermission(messaging);

        const enabled =
          authorizationStatus === AuthorizationStatus.AUTHORIZED ||
          authorizationStatus === AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          await registerFcmToken();
        } else {
          await registerDeviceForRemoteMessages(messaging);
        }
      } catch (error) {
        console.log('error:', error);
      }
    })();

    const unsubscribe = onTokenRefresh(messaging, token => {
      saveAndRegisterFcmToken(token).catch(error =>
        console.log('fcm token refresh error:', error),
      );
    });
    return unsubscribe;
  }, []);
};

export default useFCMTokenManager;
