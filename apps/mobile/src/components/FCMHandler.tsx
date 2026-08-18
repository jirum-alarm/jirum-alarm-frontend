import React, {useEffect, useRef} from 'react';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import useFCMTokenManager from '@/shared/hooks/useFCMTokenManager.ts';
import {onForegroundMessageHandler} from '../shared/lib/fcm/index.ts';
import {useWebviewContext} from '../provider/WebViewRefProvider.tsx';
import {MixpanelService} from '@/shared/lib/analytics/mixpanel';
import {
  navigateToProductDetail,
  navigateToTrending,
} from '@/navigations/navigation-ref.ts';
import useDeepLink from '@/shared/hooks/useDeepLink.ts';

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

  // 딥링크(공유 링크·유니버설 링크)도 푸시와 같은 열기 경로를 탄다.
  // 상세는 navigateToProductDetail 이 가져가고, 나머지만 여기로 떨어진다.
  useDeepLink((url: string) => {
    // 발견 탭은 네이티브라 웹뷰 주입 대상이 없다. 먼저 가져가게 한다.
    if (navigateToTrending(url)) return;
    getTargetWebViewRef(url).current?.injectJavaScript(goProductDetail(url));
  });

  // ✅ 앱이 종료된 상태에서 푸시 알람을 클릭했을 때 처리
  const tryInjectPendingUrl = () => {
    if (pendingUrlRef.current) {
      const targetRef = getTargetWebViewRef(pendingUrlRef.current);

      const attemptInject = (retryCount = 0) => {
        if (retryCount > 10) {
          return;
        }

        setTimeout(() => {
          // 콜드 스타트에서는 네비게이터가 아직 안 떠 있을 수 있으므로
          // 재시도 루프 안에서 매번 확인한다. 루프 밖에서 한 번만 보면
          // 첫 시도에 실패해 웹뷰로 새고, iOS 에선 상세가 안 뜬다.
          if (
            pendingUrlRef.current &&
            (navigateToProductDetail(pendingUrlRef.current) ||
              navigateToTrending(pendingUrlRef.current))
          ) {
            pendingUrlRef.current = null;
            return;
          }

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

  /**
   * 상품 상세면 네이티브로 push 하고, 아니면 기존 웹뷰 주입으로 넘긴다.
   *
   * 웹뷰 주입만 쓰면 iOS 에서 네이티브 상세가 안 뜬다 — 주입된 이동은
   * TabWebView URL 필터의 navigationType === 'click' 게이트를 못 통과한다.
   */
  const openNotificationUrl = (url: string) => {
    if (navigateToProductDetail(url)) return;
    // 발견 탭(`/trending/*`)도 네이티브다 — 웹뷰 폴백으로 새면 엉뚱한 탭에 뜬다.
    if (navigateToTrending(url)) return;
    const targetRef = getTargetWebViewRef(url);
    targetRef.current?.injectJavaScript(goProductDetail(url));
  };

  // ✅ 포그라운드에서 푸시 알람을 클릭했을 때 처리
  const handleForegroundEvent = (
    response: Notifications.NotificationResponse,
  ) => {
    const data = response.notification.request.content.data;
    const url = data?.link as string | undefined;
    if (url) {
      trackNotificationClick(data, 'foreground');
      openNotificationUrl(url);
    }
  };

  // ✅ 백그라운드에서 푸시 알람을 클릭했을 때 처리
  const handleNotificationOpenedApp = (remoteMessage: any) => {
    const url = remoteMessage.data?.link;
    if (url) {
      trackNotificationClick(remoteMessage.data, 'background');
      openNotificationUrl(url);
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
