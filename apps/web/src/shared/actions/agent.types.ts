export type CheckDeviceResult = {
  isMobile: boolean;
  isSafari: boolean;
  isJirumAlarmIOSApp: boolean;
  isJirumAlarmAndroidApp: boolean;
  isJirumAlarmApp: boolean;
  isApple: boolean;
  isAndroid: boolean;
  isMobileBrowser: boolean;
  /** 카톡·인스타 등 인앱 브라우저. 네이티브 Smart App Banner 가 안 뜬다. */
  isInAppBrowser: boolean;
};
