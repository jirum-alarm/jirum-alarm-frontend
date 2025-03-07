import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { PAGE } from '@/constants/page';
import { useDevice } from '@/hooks/useDevice';
import { WebViewBridge, WebViewEventType } from '@/shared/lib/webview';

const noop = () => {};

const useGoBack = (backTo: PAGE = PAGE.HOME) => {
  const router = useRouter();
  const { isJirumAlarmApp } = useDevice();

  const goBack = useCallback(() => {
    (document.referrer && document.referrer.indexOf('jirum-alarm.com') != -1) ||
    window.history.length > 1
      ? router.back()
      : router.push(backTo);
  }, [router, backTo]);

  if (isJirumAlarmApp) {
    WebViewBridge.sendMessage(WebViewEventType.PRESS_BACKBUTTON, null);
    return noop;
  }

  return goBack;
};

export default useGoBack;
