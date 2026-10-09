/**
 * @format
 */
import {AppRegistry} from 'react-native';
import './gesture-handler';
import App from './App';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import {
  ensureAlarmChannel,
  foregroundNotificationBehavior,
  onBackgroundMessageHandler,
} from './src/shared/lib/fcm/fcm-handler';

setBackgroundMessageHandler(getMessaging(), onBackgroundMessageHandler);
// 서버 푸시가 지정하는 채널을 앱 시작 때 미리 만든다(Android). 실패해도 기본 채널로 가므로 삼킨다.
ensureAlarmChannel().catch(() => {});
// 없으면 앱이 떠 있을 때 온 푸시가 표시되지 않는다(fcm-handler 주석 참고).
Notifications.setNotificationHandler({
  handleNotification: async notification =>
    foregroundNotificationBehavior(notification),
});

AppRegistry.registerComponent('jirumAlarmMobile', () => App);
