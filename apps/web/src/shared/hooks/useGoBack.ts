import { decideGoBack, NATIVE_STACK_DATASET_KEY } from '@jirum/domain/go-back';
import { useCallback } from 'react';

import { PAGE } from '@/shared/config/page';
import useMyRouter from '@/shared/hooks/useMyRouter';
import { isInApp } from '@/shared/lib/webview/native';
import { WebViewBridge } from '@/shared/lib/webview/sender';
import { WebViewEventType } from '@/shared/lib/webview/type';

const useGoBack = (backTo: string = PAGE.HOME) => {
  const router = useMyRouter();

  const goBack = useCallback(() => {
    // 판정은 정본 decideGoBack(앱이 심는 dataset 신호와 짝). 네이티브 스택 위 웹뷰(검색 등)에서 웹 history 로
    // 홈을 열면 검색 화면 안에 홈이 그려지므로, 그땐 네이티브 뒤로가기로 스택을 닫는다.
    const action = decideGoBack({
      nativeStack: document.documentElement.dataset[NATIVE_STACK_DATASET_KEY],
      isInApp: isInApp(),
      referrer: document.referrer,
      historyLength: window.history.length,
    });
    if (action === 'native-pop') {
      WebViewBridge.sendMessage(WebViewEventType.PRESS_BACKBUTTON, null);
    } else if (action === 'router-back') {
      router.back();
    } else {
      router.push(backTo);
    }
  }, [router, backTo]);

  return goBack;
};

export default useGoBack;
