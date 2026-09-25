/**
 * @format
 */
import {AppRegistry} from 'react-native';
import './gesture-handler';
import App from './App';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import {
  foregroundNotificationBehavior,
  onBackgroundMessageHandler,
} from './src/shared/lib/fcm/fcm-handler';

messaging().setBackgroundMessageHandler(onBackgroundMessageHandler);
// 없으면 앱이 떠 있을 때 온 푸시가 표시되지 않는다(fcm-handler 주석 참고).
Notifications.setNotificationHandler({
  handleNotification: async notification =>
    foregroundNotificationBehavior(notification),
});

AppRegistry.registerComponent('jirumAlarmMobile', () => App);
