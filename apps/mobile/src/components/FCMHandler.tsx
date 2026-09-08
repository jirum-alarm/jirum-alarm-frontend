import React, {useEffect, useRef} from 'react';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import useFCMTokenManager from '@/shared/hooks/useFCMTokenManager.ts';
import {onForegroundMessageHandler} from '../shared/lib/fcm/index.ts';
import {useWebviewContext} from '../provider/WebViewRefProvider.tsx';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {navigateToNativeRoute} from '@/navigations/navigation-ref.ts';
import useDeepLink from '@/shared/hooks/useDeepLink.ts';
import {queryClient} from '@/provider/ReactQueryProvider.tsx';
import {NotificationQueries} from '@/entities/notification';

interface FcmHandlerProps {
  children?: React.ReactNode;
}

const goProductDetail = (url: string) => `window.location.href = "${url}";`;

// 알림 클릭 추적 — 서버 notification_sent(발송)와 target/target_id/url 로 연결.
// state: killed(종료) | background | foreground. push_history/GA4 발송과 퍼널.
const trackNotificationClick = (
  data: {link?: unknown; target?: unknown; target_id?: unknown} | undefined,
  state: 'killed' | 'background' | 'foreground',
) => {
  Analytics.track('notification_clicked', {
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
  // 네이티브 판정은 useDeepLink 안에서 끝나고, 거기서 거른 URL 만 여기로 떨어진다
  // (커뮤니티·내정보 탭 = 루트가 아직 웹뷰).
  useDeepLink((url: string) => {
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
            navigateToNativeRoute(pendingUrlRef.current, {
              allowWebViewRoute: true,
            })
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
   * 알림이 가리키는 URL 을 연다. 네이티브 화면이 있으면 그쪽으로,
   * 없으면 기존 웹뷰 주입으로 넘긴다.
   *
   * 웹뷰 주입만 쓰면 iOS 에서 네이티브 상세가 안 뜬다 — 주입된 이동은
   * TabWebView URL 필터의 navigationType === 'click' 게이트를 못 통과한다.
   */
  const openNotificationUrl = (url: string) => {
    // 네이티브가 그릴 수 있는 화면이면 전부 여기서 가져간다 — 웹뷰 폴백으로 새면
    // 홈·발견·알림 탭에선 주입 대상이 없어 **아무 일도 일어나지 않는다**.
    if (navigateToNativeRoute(url, {allowWebViewRoute: true})) return;
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

    // ★앱을 켜둔 채 받은 푸시도 탭바 알림 점에 반영한다.
    // onForegroundMessageHandler 는 **앱 아이콘 배지만** 갱신하므로, 그대로 두면
    // 아이콘 숫자는 오르는데 탭바 점은 안 켜진다 — 같은 사실이 두 곳에서 갈린다.
    // 점 판정은 미읽음 수에서 파생되므로(useHasNewAlarm) 그 쿼리만 무효화하면 된다.
    //
    // 훅(useQueryClient) 대신 모듈 싱글턴을 쓴다 — Provider 가 쓰는 것과 같은
    // 인스턴스이고, 여기서는 렌더 밖 리스너에서 캐시만 한 번 만진다.
    const unsubscribeUnreadSync = messaging().onMessage(() => {
      queryClient
        .invalidateQueries({
          queryKey: NotificationQueries.unreadCount().queryKey,
        })
        // 무효화 실패가 알림 표시 자체를 깨서는 안 된다.
        .catch(() => {});
    });

    const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(
      handleNotificationOpenedApp,
    );

    return () => {
      unsubscribeMessage();
      unsubscribeUnreadSync();
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
