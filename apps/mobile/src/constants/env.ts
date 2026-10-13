import {Platform} from 'react-native';

const SERVICE_URL = 'https://jirum-alarm.com';
// const SERVICE_URL = 'https://dev.jirum-alarm.com/';

const USER_AGENT =
  Platform.OS === 'ios'
    ? 'IOS ReactNative Webview Jirum Alarm'
    : 'Android ReactNative Webview Jirum Alarm';

/**
 * 사용법 · 자주 묻는 질문(web `/help`). 내정보 메뉴·홈 「어떻게 쓰나요?」 배너가 웹뷰로 연다.
 * 예전엔 about-us(서비스 밖 소개 사이트)를 인앱 브라우저로 열었다 — 다녀오면 흐름이 끊기고 내용도 낡았다.
 */
const HELP_PATH = '/help';

export {SERVICE_URL, USER_AGENT, HELP_PATH};
