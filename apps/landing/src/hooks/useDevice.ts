'use client';

import { useEffect, useState } from 'react';

export const useDevice = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isApple, setIsApple] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isJirumAlarmIOSApp, setIsJirumAlarmIOSApp] = useState<boolean | 'ios' | 'android'>(false);
  const [isJirumAlarmAndroidApp, setIsJirumAlarmAndroidApp] = useState<boolean | 'ios' | 'android'>(
    false,
  );
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    const userAgent = window.navigator.userAgent;
    const isMobileDevice = Boolean(
      userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop|Mobile/i),
    );
    setIsMobile(isMobileDevice);

    setIsApple(Boolean(userAgent.match(/iPhone|iPad|iPod|Mac/i)));
    setIsIos(Boolean(userAgent.match(/iPhone|iPad|iPod/i)));
    setIsAndroid(Boolean(userAgent.match(/Android/i)));
    setIsJirumAlarmIOSApp(Boolean(userAgent.match(/IOS ReactNative Webview Jirum Alarm/i)));
    setIsJirumAlarmAndroidApp(Boolean(userAgent.match(/Android ReactNative Webview Jirum Alarm/i)));
  }, []);

  return {
    isMobile,
    isApple,
    isIos,
    isAndroid,
    isJirumAlarmIOSApp,
    isJirumAlarmAndroidApp,
    isJirumAlarmApp: !!(isJirumAlarmIOSApp || isJirumAlarmAndroidApp),
    isMounted,
  };
};
