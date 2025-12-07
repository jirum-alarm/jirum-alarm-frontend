import { atom } from 'jotai';

type DeviceInfo = {
  isMobile: boolean;
  isSafari: boolean;
  isJirumAlarmIOSApp: boolean;
  isJirumAlarmAndroidApp: boolean;
  isJirumAlarmApp: boolean;
  isApple: boolean;
  isAndroid: boolean;
  isMobileBrowser: boolean;
};

export const getDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isMobile: false,
      isSafari: false,
      isJirumAlarmIOSApp: false,
      isJirumAlarmAndroidApp: false,
      isJirumAlarmApp: false,
      isApple: false,
      isAndroid: false,
      isMobileBrowser: false,
    };
  }

  const ua = navigator.userAgent || '';
  const isJirumAlarmIOSApp = /IOS ReactNative Webview Jirum Alarm/i.test(ua);
  const isLegacyJirumAlarmIOSApp = /IOS Flutter Webview Jirum Alarm/i.test(ua);
  const isJirumAlarmAndroidApp = /Android ReactNative Webview Jirum Alarm/i.test(ua);
  const isLegacyJirumAlarmAndroidApp = /Android Flutter Webview Jirum Alarm/i.test(ua);
  const isJirumAlarmApp =
    isJirumAlarmIOSApp ||
    isJirumAlarmAndroidApp ||
    isLegacyJirumAlarmIOSApp ||
    isLegacyJirumAlarmAndroidApp;

  const isMobile =
    /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || isJirumAlarmApp;
  const isSafari =
    /Safari/i.test(ua) &&
    !/Chrome/i.test(ua) &&
    !/CriOS/i.test(ua) &&
    !/FxiOS/i.test(ua) &&
    !/OPiOS/i.test(ua);

  const isApple = /iPhone|iPad|iPod|Macintosh/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  const isMobileBrowser = isMobile && !isJirumAlarmApp;

  return {
    isMobile,
    isSafari,
    isJirumAlarmIOSApp,
    isJirumAlarmAndroidApp,
    isJirumAlarmApp,
    isApple,
    isAndroid,
    isMobileBrowser,
  };
};

export const deviceAtom = atom<DeviceInfo>(getDeviceInfo());
