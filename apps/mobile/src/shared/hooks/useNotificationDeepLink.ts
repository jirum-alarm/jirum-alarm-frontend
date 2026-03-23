import {useEffect} from 'react';
import notifee, {EventType} from '@notifee/react-native';
import type WebView from 'react-native-webview';
import {SERVICE_URL} from '@/constants/env';
import type {RefObject} from 'react';

const useNotificationDeepLink = (webviewRef: RefObject<WebView | null>) => {
  useEffect(() => {
    // 앱이 포그라운드 상태일 때 알림 탭 처리
    const unsubscribe = notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS) {
        const url = detail.notification?.data?.url as string | undefined;
        if (url && webviewRef.current) {
          const targetUrl = url.startsWith('http')
            ? url
            : `${SERVICE_URL}${url}`;
          webviewRef.current.injectJavaScript(
            `window.location.href = '${targetUrl}'; true;`,
          );
        }
      }
    });

    return () => unsubscribe();
  }, [webviewRef]);

  useEffect(() => {
    // 앱이 종료 상태에서 알림 탭으로 열린 경우
    const handleInitialNotification = async () => {
      const initialNotification = await notifee.getInitialNotification();
      if (initialNotification) {
        const url = initialNotification.notification.data?.url as
          | string
          | undefined;
        if (url && webviewRef.current) {
          const targetUrl = url.startsWith('http')
            ? url
            : `${SERVICE_URL}${url}`;
          webviewRef.current.injectJavaScript(
            `window.location.href = '${targetUrl}'; true;`,
          );
        }
      }
    };

    // WebView가 로드된 후 초기 알림을 처리하기 위해 약간의 지연
    const timer = setTimeout(handleInitialNotification, 1000);
    return () => clearTimeout(timer);
  }, [webviewRef]);
};

export default useNotificationDeepLink;
