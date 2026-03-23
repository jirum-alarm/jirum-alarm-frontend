import {Platform} from 'react-native';

const SERVICE_URL = 'https://jirum-alarm.com';
// const SERVICE_URL = 'https://dev.jirum-alarm.com/';

const USER_AGENT =
  Platform.OS === 'ios'
    ? 'IOS ReactNative Webview Jirum Alarm'
    : 'Android ReactNative Webview Jirum Alarm';

export {SERVICE_URL, USER_AGENT};
