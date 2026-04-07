import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import {Platform} from 'react-native';

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
