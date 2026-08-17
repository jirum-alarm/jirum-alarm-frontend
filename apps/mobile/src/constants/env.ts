import {Platform} from 'react-native';

const SERVICE_URL = 'https://jirum-alarm.com';
// const SERVICE_URL = 'https://dev.jirum-alarm.com/';

const USER_AGENT =
  Platform.OS === 'ios'
    ? 'IOS ReactNative Webview Jirum Alarm'
    : 'Android ReactNative Webview Jirum Alarm';

/** 소개 페이지. web shared/config/env.ts 의 LANDING_URL 과 같은 값. */
const LANDING_URL = 'https://about-us.jirum-alarm.com';

export {SERVICE_URL, USER_AGENT, LANDING_URL};
