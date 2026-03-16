import {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

/**
 * Handle FCM messages when app is in foreground
 *
 * Displays a local notification using Notifee
 *
 * @param message - FCM remote message
 */
export async function onForegroundMessageHandler(
  message: FirebaseMessagingTypes.RemoteMessage,
) {
  const channelId = await notifee.createChannel({
    id: 'alarm',
    name: '지름 알림',
  });
  try {
    await notifee.displayNotification({
      title: message.notification?.title,
      body: message.notification?.body,
      data: message.data,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        sound: 'default',
      },
    });
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
  const channelId = await notifee.createChannel({
    id: 'alarm',
    name: '지름 알림',
  });
  try {
    await notifee.displayNotification({
      title: message.notification?.title,
      body: message.notification?.body,
      data: message.data,
      android: {
        channelId,
        smallIcon: 'ic_launcher',
        pressAction: {
          id: 'default',
        },
      },
    });
  } catch (error) {
    console.log('FCM background notification error:', error);
  }
}
