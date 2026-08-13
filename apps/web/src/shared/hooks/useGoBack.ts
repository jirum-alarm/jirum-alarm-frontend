import { useCallback } from 'react';

import { PAGE } from '@/shared/config/page';
import useMyRouter from '@/shared/hooks/useMyRouter';
import { isInApp } from '@/shared/lib/webview/native';
import { WebViewBridge } from '@/shared/lib/webview/sender';
import { WebViewEventType } from '@/shared/lib/webview/type';

const useGoBack = (backTo: string = PAGE.HOME) => {
  const router = useMyRouter();

  const goBack = useCallback(() => {
    // 네이티브 스택 위 웹뷰(검색 등). 웹 history 로 홈을 열면 검색 화면 안에
    // 홈이 그려지므로, 네이티브 뒤로가기로 스택을 닫는다.
    if (
      typeof document !== 'undefined' &&
      document.documentElement.dataset.nativeStack === 'true' &&
      isInApp()
    ) {
      WebViewBridge.sendMessage(WebViewEventType.PRESS_BACKBUTTON, null);
      return;
    }

    if (
      (document.referrer && document.referrer.indexOf('jirum-alarm.com') != -1) ||
      window.history.length > 1
    ) {
      router.back();
    } else {
      router.push(backTo);
    }
  }, [router, backTo]);

  return goBack;
};

export default useGoBack;
