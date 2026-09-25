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
 * Handle FCM messages when app is in foreground
 *
 * Displays a local notification using expo-notifications
 *
 * @param message - FCM remote message
 */
export async function onForegroundMessageHandler(
  message: FirebaseMessagingTypes.RemoteMessage,
) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alarm', {
      name: '지름 알림',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

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
      trigger: null, // send immediately
    });

    if (Platform.OS === 'ios' && badgeCount >= 0) {
      await Notifications.setBadgeCountAsync(badgeCount);
    }
  } catch (error) {
    console.log('FCM foreground notification error:', error);
  }
}

/**
 * Handle FCM messages when app is in background
 *
 * @param message - FCM remote message
 */
export async function onBackgroundMessageHandler(
  message: FirebaseMessagingTypes.RemoteMessage,
) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alarm', {
      name: '지름 알림',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: message.notification?.title || null,
        body: message.notification?.body || null,
        data: message.data || {},
      },
      trigger: null,
    });
  } catch (error) {
    console.log('FCM background notification error:', error);
  }
}
