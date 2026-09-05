'use client';

import { atom, useAtom, useAtomValue } from 'jotai';
import { useEffect } from 'react';

import { isInAppBrowserUA } from '@/shared/config/user-agent';

type DeviceInfo = {
  isMobile: boolean;
  isSafari: boolean;
  isJirumAlarmIOSApp: boolean;
  isJirumAlarmAndroidApp: boolean;
  isJirumAlarmApp: boolean;
  isApple: boolean;
  isAndroid: boolean;
  isMobileBrowser: boolean;
  isInAppBrowser: boolean;
};

const EMPTY_DEVICE: DeviceInfo = {
  isMobile: false,
  isSafari: false,
  isJirumAlarmIOSApp: false,
  isJirumAlarmAndroidApp: false,
  isJirumAlarmApp: false,
  isApple: false,
  isAndroid: false,
  isMobileBrowser: false,
  isInAppBrowser: false,
};

const getDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return EMPTY_DEVICE;
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
  const isInAppBrowser = isInAppBrowserUA(ua);

  return {
    isMobile,
    isSafari,
    isJirumAlarmIOSApp,
    isJirumAlarmAndroidApp,
    isJirumAlarmApp,
    isApple,
    isAndroid,
    isMobileBrowser,
    isInAppBrowser,
  };
};

/**
 * 서버(app/actions/agent.ts 의 checkDevice)가 같은 UA 를 이미 파싱해서 넘겨준다.
 * ServerStateProvider 가 이 atom 을 하이드레이션 시점에 심으므로, 클라이언트는
 * 첫 렌더부터 정답을 들고 시작한다 — useEffect 로 다시 계산해서 한 프레임
 * 오답을 그리던 게 첫 페인트 깜빡임의 원인이었다.
 */
export const deviceAtom = atom<DeviceInfo>(EMPTY_DEVICE);

/** 서버값이 심겼는지. 심겼으면 클라이언트 재계산을 건너뛴다. */
export const isDeviceResolvedAtom = atom(false);

export const useDevice = () => {
  const [device, setDevice] = useAtom(deviceAtom);
  const isResolved = useAtomValue(isDeviceResolvedAtom);

  // ponytail: 서버값이 없을 때만(스토리북·테스트 등 Provider 밖) 클라이언트에서 채운다.
  useEffect(() => {
    if (!isResolved) setDevice(getDeviceInfo());
  }, [isResolved, setDevice]);

  return { device, isHydrated: isResolved };
};
