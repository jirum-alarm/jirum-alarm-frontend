import { headers } from 'next/headers';
import { userAgent } from 'next/server';

async function checkDevice() {
  const headersList = await headers();
  const { device, browser, ua } = userAgent({ headers: headersList });
  const userAgentString = ua || '';

  const isJirumAlarmIOSApp = Boolean(userAgentString.match(/IOS ReactNative Webview Jirum Alarm/i));
  const isLegacyJirumAlarmIOSApp = Boolean(
    userAgentString.match(/IOS Flutter Webview Jirum Alarm/i),
  );
  const isJirumAlarmAndroidApp = Boolean(
    userAgentString.match(/Android ReactNative Webview Jirum Alarm/i),
  );
  const isLegacyJirumAlarmAndroidApp = Boolean(
    userAgentString.match(/Android Flutter Webview Jirum Alarm/i),
  );
  const isJirumAlarmApp = !!(
    isJirumAlarmIOSApp ||
    isJirumAlarmAndroidApp ||
    isLegacyJirumAlarmIOSApp ||
    isLegacyJirumAlarmAndroidApp
  );
  const isMobile = Boolean(device.type === 'mobile') || isJirumAlarmApp;
  const isSafari = Boolean(browser.name === 'Mobile Safari');

  return {
    isMobile,
    isSafari,
    isJirumAlarmIOSApp,
    isJirumAlarmAndroidApp,
    isJirumAlarmApp,
  };
}

export { checkDevice };
