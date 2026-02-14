'use client';

import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

import { useIsHydrated } from './useIsHydrated';

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

const getDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    // SSR 환경에서는 기본값 반환
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
    /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    isJirumAlarmApp ||
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0 && /Macintosh/i.test(ua));
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

const deviceAtom = atom<DeviceInfo>(getDeviceInfo());

export const useDevice = () => {
  const isHydrated = useIsHydrated();

  const [device, setDevice] = useAtom(deviceAtom);

  useEffect(() => {
    if (isHydrated) {
      setDevice(getDeviceInfo());
    }
  }, [setDevice, isHydrated]);

  return { device, isHydrated };
};
