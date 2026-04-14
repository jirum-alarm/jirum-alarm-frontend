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
  const {getWebViewRefByUrl, webviewRef} = useWebviewContext();
  const pendingUrlRef = useRef<string | null>(null);

  useFCMTokenManager();

  const getTargetWebViewRef = (url: string) => {
    return getWebViewRefByUrl(url) ?? webviewRef;
  };

  // ✅ 앱이 종료된 상태에서 푸시 알람을 클릭했을 때 처리
  const tryInjectPendingUrl = () => {
    if (pendingUrlRef.current) {
      const targetRef = getTargetWebViewRef(pendingUrlRef.current);

      const attemptInject = (retryCount = 0) => {
        if (retryCount > 10) {
          return;
        }

        setTimeout(() => {
          if (targetRef.current && pendingUrlRef.current) {
            targetRef.current.injectJavaScript(`
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
        }, 1000 + retryCount * 500);
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
      const targetRef = getTargetWebViewRef(url);
      targetRef.current?.injectJavaScript(goProductDetail(url));
    }
  };

  // ✅ 백그라운드에서 푸시 알람을 클릭했을 때 처리
  const handleNotificationOpenedApp = (remoteMessage: any) => {
    const url = remoteMessage.data?.link;
    if (url) {
      const targetRef = getTargetWebViewRef(url);
      targetRef.current?.injectJavaScript(goProductDetail(url));
    }
  };

  useEffect(() => {
    handleInitialNotification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (webviewRef.current && pendingUrlRef.current) {
      tryInjectPendingUrl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webviewRef]);

  useEffect(() => {
    const unsubscribeMessage = messaging().onMessage(
      onForegroundMessageHandler,
    );

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
