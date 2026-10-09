'use client';

import { useEffect } from 'react';

import { setFcmToken as setFcmTokenAction } from '@/app/actions/token';

import { TokenType } from '@/shared/api/gql/graphql';
import { NotificationService } from '@/shared/api/notification/notification.service';
import { firebaseConfig } from '@/shared/config/firebase';

const FCMConfig = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let unsubscribe: (() => void) | null = null;

    const handleSwMessage = (event: MessageEvent) => {
      if (event.data?.type === 'push_notification_clicked') {
        (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
          event: 'push_notification_clicked',
          push_title: event.data.push_title,
          push_body: event.data.push_body,
        });
        if (event.data.link) window.location.href = event.data.link;
      }
    };
    navigator.serviceWorker.addEventListener('message', handleSwMessage);

    const setupGranted = async () => {
      try {
        // 권한이 이미 허용된 경우에만 토큰 조회/구독
        if (Notification.permission !== 'granted') return;

        // firebase 는 이 분기에서만 필요하다. 정적 import 였을 땐 모든 페이지 초기 번들에 실려
        // 알림을 켠 적 없는 방문자도 매번 받았다(13KB gz).
        const [{ getApps, initializeApp }, { getMessaging, getToken, onMessage }] =
          await Promise.all([import('firebase/app'), import('firebase/messaging')]);
        const app = getApps()[0] ?? initializeApp(firebaseConfig);
        const messaging = getMessaging(app);
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        const token = await getToken(messaging, { vapidKey });
        if (token) {
          await setFcmTokenAction(token);
          // 권한을 이미 허용한 재방문자도 서버에 다시 등록한다. 쿠키에만 두면 서버 행이 사라졌을 때
          // (2026-08-18 user_token 전체 삭제) 권한 프롬프트를 다시 거치기 전엔 영영 복구되지 않았다.
          // 서버 add 는 같은 토큰이면 insert 없이 끝나 멱등하다.
          NotificationService.addPushToken({ token, tokenType: TokenType.Fcm }).catch((e) =>
            console.log('FCM token register error: ', e),
          );
        }

        unsubscribe = onMessage(messaging, (payload) => {
          // 페이지를 보고 있을 때 온 푸시는 브라우저가 아무것도 띄우지 않는다 → 직접 띄운다.
          // 서비스워커 등록으로 띄워야 모바일 크롬에서도 뜨고, 클릭은 서비스워커가 받아 위 handleSwMessage 로 넘긴다.
          const { title, body } = payload.notification ?? {};
          if (title) {
            navigator.serviceWorker
              .getRegistration('/firebase-cloud-messaging-push-scope')
              .then((registration) =>
                registration?.showNotification(title, {
                  body,
                  icon: '/icon.png',
                  data: { title, body, link: payload.fcmOptions?.link ?? payload.data?.link },
                }),
              )
              .catch((e) => console.log('foreground notification error: ', e));
          }
          (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
            event: 'push_notification_received',
            push_title: payload.notification?.title,
            push_body: payload.notification?.body,
            push_state: 'foreground',
          });
        });
      } catch (err) {
        console.log('FCM setup error: ', err);
      }
    };

    setupGranted();

    return () => {
      unsubscribe?.();
      navigator.serviceWorker.removeEventListener('message', handleSwMessage);
    };
  }, []);

  return null;
};

export default FCMConfig;
