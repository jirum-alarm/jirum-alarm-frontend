/**
 * @format
 */
import {AppRegistry} from 'react-native';
import './gesture-handler';
import App from './App';
import messaging from '@react-native-firebase/messaging';
import {onBackgroundMessageHandler} from './src/shared/lib/fcm/fcm-handler';

messaging().setBackgroundMessageHandler(onBackgroundMessageHandler);

AppRegistry.registerComponent('jirumAlarmMobile', () => App);
