import React, {useEffect, useRef} from 'react';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import useFCMTokenManager from '@/shared/hooks/useFCMTokenManager.ts';
import {onForegroundMessageHandler} from '../shared/lib/fcm/index.ts';
import {useWebviewContext} from '../provider/WebViewRefProvider.tsx';

interface FcmHandlerProps {
  children?: React.ReactNode;
}

const goProductDetail = (url: string) => `window.location.href = "${url}";`;

const FcmHandler = ({children}: FcmHandlerProps) => {
  const {webviewRef} = useWebviewContext();
  const pendingUrlRef = useRef<string | null>(null);

  useFCMTokenManager();

  // ✅ 앱이 종료된 상태에서 푸시 알람을 클릭했을 때 처리
  const tryInjectPendingUrl = () => {
    if (pendingUrlRef.current && webviewRef.current) {
      const attemptInject = (retryCount = 0) => {
        if (retryCount > 10) {
          return;
        } // 최대 10번 재시도

        setTimeout(() => {
          if (webviewRef.current && pendingUrlRef.current) {
            webviewRef.current.injectJavaScript(`
              if (document.readyState === 'complete') {
                ${goProductDetail(pendingUrlRef.current)}
              } else {
                setTimeout(() => { ${goProductDetail(
                  pendingUrlRef.current,
                )} }, 500);
              }
            `);
            pendingUrlRef.current = null;
          } else {
            attemptInject(retryCount + 1);
          }
        }, 1000 + retryCount * 500); // 점진적 지연
      };

      attemptInject();
    }
  };

  const handleInitialNotification = async () => {
    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification) {
      const url = initialNotification.data?.link;
      if (!!url && typeof url === 'string') {
        pendingUrlRef.current = url;
        tryInjectPendingUrl();
      }
    }
  };

  // ✅ 포그라운드에서 푸시 알람을 클릭했을 때 처리
  const handleForegroundEvent = (
    response: Notifications.NotificationResponse,
  ) => {
    const url = response.notification.request.content.data?.link as
      | string
      | undefined;
    if (url) {
      webviewRef.current?.injectJavaScript(goProductDetail(url));
    }
  };

  // ✅ 백그라운드에서 푸시 알람을 클릭했을 때 처리
  const handleNotificationOpenedApp = (remoteMessage: any) => {
    const url = remoteMessage.data?.link;
    if (url) {
      webviewRef.current?.injectJavaScript(goProductDetail(url));
    }
  };

  useEffect(() => {
    // ✅ 앱이 처음 실행될 때(종료 상태에서 푸시 클릭 시) 알림 처리
    handleInitialNotification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // ✅ webviewRef가 준비되면 대기 중인 URL 처리
    if (webviewRef.current && pendingUrlRef.current) {
      tryInjectPendingUrl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webviewRef]);

  useEffect(() => {
    // ✅ 포그라운드 메시지 처리
    const unsubscribeMessage = messaging().onMessage(
      onForegroundMessageHandler,
    );

    // ✅ 백그라운드 메시지 클릭 이벤트 리스너 등록
    const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(
      handleNotificationOpenedApp,
    );

    return () => {
      unsubscribeMessage();
      unsubscribeOpenedApp();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // ✅ 포그라운드 알림 클릭 이벤트 처리
    const subscription = Notifications.addNotificationResponseReceivedListener(
      handleForegroundEvent,
    );

    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};

export default FcmHandler;
