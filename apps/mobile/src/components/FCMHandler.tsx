import React, {useEffect, useRef} from 'react';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import useFCMTokenManager from '@/shared/hooks/useFCMTokenManager.ts';
import {onForegroundMessageHandler} from '../shared/lib/fcm/index.ts';
import {useWebviewContext} from '../provider/WebViewRefProvider.tsx';
import {MixpanelService} from '@/shared/lib/analytics/mixpanel';

interface FcmHandlerProps {
  children?: React.ReactNode;
}

const goProductDetail = (url: string) => `window.location.href = "${url}";`;

// 알림 클릭 추적 — 서버 notification_sent(발송)와 target/target_id/url 로 연결.
// state: killed(종료) | background | foreground. push_history/Mixpanel 발송과 퍼널.
const trackNotificationClick = (
  data: {link?: unknown; target?: unknown; target_id?: unknown} | undefined,
  state: 'killed' | 'background' | 'foreground',
) => {
  MixpanelService.track('notification_clicked', {
    url: typeof data?.link === 'string' ? data.link : undefined,
    target: data?.target,
    target_id: data?.target_id,
    platform: 'app',
    state,
  });
};

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
        trackNotificationClick(initialNotification.data, 'killed');
        pendingUrlRef.current = url;
        tryInjectPendingUrl();
      }
    }
  };

  // ✅ 포그라운드에서 푸시 알람을 클릭했을 때 처리
  const handleForegroundEvent = (
    response: Notifications.NotificationResponse,
  ) => {
    const data = response.notification.request.content.data;
    const url = data?.link as string | undefined;
    if (url) {
      trackNotificationClick(data, 'foreground');
      const targetRef = getTargetWebViewRef(url);
      targetRef.current?.injectJavaScript(goProductDetail(url));
    }
  };

  // ✅ 백그라운드에서 푸시 알람을 클릭했을 때 처리
  const handleNotificationOpenedApp = (remoteMessage: any) => {
    const url = remoteMessage.data?.link;
    if (url) {
      trackNotificationClick(remoteMessage.data, 'background');
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
