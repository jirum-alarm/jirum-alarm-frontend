import { useCallback } from 'react';

import { PAGE } from '@/constants/page';
import { useDevice } from '@/hooks/useDevice';
import useMyRouter from '@/hooks/useMyRouter';
import { WebViewBridge, WebViewEventType } from '@/shared/lib/webview';

const useGoBack = (backTo: PAGE = PAGE.HOME) => {
  const router = useMyRouter();
  const { isJirumAlarmApp } = useDevice();

  const goBack = useCallback(() => {
    if (
      (document.referrer && document.referrer.indexOf('jirum-alarm.com') != -1) ||
      window.history.length > 1
    ) {
      router.back();
    } else {
      router.push(backTo);
    }
  }, [router, backTo]);

  if (isJirumAlarmApp) {
    return () => WebViewBridge.sendMessage(WebViewEventType.PRESS_BACKBUTTON, null);
  }

  return goBack;
};

export default useGoBack;
