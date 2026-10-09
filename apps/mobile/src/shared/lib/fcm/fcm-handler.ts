import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import {Platform} from 'react-native';

/**
 * 앱이 떠 있을 때 알림을 보여줄지 정한다 — `Notifications.setNotificationHandler` 에 건다.
 *
 * 🔴expo-notifications 는 이 핸들러가 없으면 포그라운드 알림을 **아무것도 표시하지
 * 않는다.** Notifee 시절엔 displayNotification 이 그냥 띄웠기 때문에, expo 로 옮기면서
 * (3db4ac15) 포그라운드 푸시가 배지만 바뀌고 배너는 조용히 사라졌다.
 *
 * ★원격 푸시(trigger.type === 'push')는 숨기고 **우리가 예약한 로컬 사본만** 띄운다.
 * iOS 는 원격 원본도 이 핸들러를 거치는데, onForegroundMessageHandler 가 같은 내용을
 * 로컬로 한 번 더 띄우므로 둘 다 보여주면 한 푸시가 두 번 뜬다.
 */
export function foregroundNotificationBehavior(
  notification: Notifications.Notification,
): Notifications.NotificationBehavior {
  const {trigger} = notification.request;
  const show = !(trigger && 'type' in trigger && trigger.type === 'push');
  return {
    shouldShowBanner: show,
    shouldShowList: show,
    shouldPlaySound: show,
    // 배지는 onForegroundMessageHandler 가 setBadgeCountAsync 로 직접 맞춘다.
    shouldSetBadge: false,
  };
}

/**
 * Android 알림 채널 'alarm'(중요도 HIGH=화면 위 배너). 서버 푸시가 android.notification.channel_id='alarm' 을 지정하므로
 * **앱 시작 때** 만들어 둔다 — 예전엔 포그라운드 수신 때만 만들어, 앱이 떠 있을 때 푸시를 한 번도 안 받은 기기는
 * 백그라운드 푸시가 FCM 기본 채널(「기타」, 중요도 보통 → 배너 없음)로 떨어졌다. 같은 값으로 다시 불러도 무해하다.
 */
export async function ensureAlarmChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('alarm', {
    name: '지름알림',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

/**
 * Handle FCM messages when app is in foreground
 *
 * Displays a local notification using expo-notifications
 *
 * @param message - FCM remote message
 */
export async function onForegroundMessageHandler(
  message: FirebaseMessagingTypes.RemoteMessage,
) {
  await ensureAlarmChannel();

  const badgeCount = Number(message.data?.badge ?? 0);

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: message.notification?.title || null,
        body: message.notification?.body || null,
        data: message.data || {},
        badge: Platform.OS === 'ios' ? badgeCount : undefined,
        sound: 'default',
      },
      // 안드로이드는 채널을 지정해야 HIGH 채널(화면 위 배너)로 뜬다. null 이면 기본 채널로 가서 배너 없이 트레이에만 쌓였다.
      trigger: Platform.OS === 'android' ? {channelId: 'alarm'} : null, // send immediately
    });

    if (Platform.OS === 'ios' && badgeCount >= 0) {
      await Notifications.setBadgeCountAsync(badgeCount);
    }
  } catch (error) {
    console.log('FCM foreground notification error:', error);
  }
}

/**
 * Handle FCM messages when app is in background — **아무것도 띄우지 않는다.**
 *
 * 🔴예전엔 여기서 로컬 알림을 또 예약해 백그라운드 푸시가 두 번 떴다.
 * RNFB 는 백그라운드·종료 상태면 payload 종류와 무관하게 이 핸들러를 부르고
 * (ReactNativeFirebaseMessagingReceiver → HeadlessService), 동시에 FCM SDK(Android)·
 * APNs(iOS, content-available)가 notification 을 트레이에 이미 올린다.
 * 서버(sns.ts)는 항상 notification + data 로 보낸다. data-only 는 제목이 없어
 * 로컬로 띄워도 빈 알림이다.
 *
 * 핸들러 자체는 남겨야 한다 — 없으면 RNFB 가 경고를 내고 headless task 가 실패한다.
 */
export async function onBackgroundMessageHandler(
  _message: FirebaseMessagingTypes.RemoteMessage,
) {}
