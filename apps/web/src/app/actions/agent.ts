import { headers } from 'next/headers';
import { userAgent } from 'next/server';

async function checkDevice() {
  const headersList = await headers();
  const { device, browser, ua } = userAgent({ headers: headersList });
  const userAgentString = ua || '';

  const isMobile = Boolean(device.type === 'mobile');
  const isSafari = Boolean(browser.name === 'Mobile Safari');

  const isJirumAlarmIOSApp = Boolean(userAgentString.match(/IOS ReactNative Webview Jirum Alarm/i));
  const isJirumAlarmAndroidApp = Boolean(
    userAgentString.match(/Android ReactNative Webview Jirum Alarm/i),
  );
  const isJirumAlarmApp = !!(isJirumAlarmIOSApp || isJirumAlarmAndroidApp);

  return {
    isMobile,
    isSafari,
    isJirumAlarmIOSApp,
    isJirumAlarmAndroidApp,
    isJirumAlarmApp,
  };
}

export { checkDevice };
