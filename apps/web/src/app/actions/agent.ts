import { headers } from 'next/headers';

function checkJirumAlarmApp() {
  const userAgent = headers().get('user-agent');
  let isIosApp = false;
  let isAndroidApp = false;
  if (userAgent) {
    isIosApp = Boolean(userAgent.match(/IOS ReactNative Webview Jirum Alarm/i));
    isAndroidApp = Boolean(userAgent.match(/Android ReactNative Webview Jirum Alarm/i));
  }
  const isJirumAlarmApp = isIosApp || isAndroidApp;
  return { isJirumAlarmApp };
}

export { checkJirumAlarmApp };
