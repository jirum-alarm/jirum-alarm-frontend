import {useCallback, useEffect, useRef, useState} from 'react';
import type {WebViewProgressEvent} from 'react-native-webview/lib/WebViewTypes';

const LOADING_INDICATOR_DELAY_MS = 1000;
const LOADING_FALLBACK_TIMEOUT_MS = 15000;

/**
 * WebView 첫 진입 로딩 오버레이 상태 관리.
 * 상세(useCommonWebViewLogic)·탭(TabWebView) 두 화면이 동일 로직을 복붙해 쓰던 것을
 * 하나로 추출. 첫 로드에서만 1초 후 인디케이터 노출, 15초 fallback으로 강제 해제.
 */
export function useWebViewLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const hasInitialLoadCompletedRef = useRef(false);

  const clearLoadingState = useCallback(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    if (loadingFallbackTimerRef.current) {
      clearTimeout(loadingFallbackTimerRef.current);
      loadingFallbackTimerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const handleLoadStart = useCallback(() => {
    // 첫 진입 로드에서만 전체 로딩 오버레이를 보여준다.
    if (hasInitialLoadCompletedRef.current) {
      return;
    }
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }
    if (loadingFallbackTimerRef.current) {
      clearTimeout(loadingFallbackTimerRef.current);
      loadingFallbackTimerRef.current = null;
    }
    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(true);
      loadingFallbackTimerRef.current = setTimeout(() => {
        setIsLoading(false);
        loadingFallbackTimerRef.current = null;
      }, LOADING_FALLBACK_TIMEOUT_MS);
    }, LOADING_INDICATOR_DELAY_MS);
  }, []);

  const handleLoadEnd = useCallback(() => {
    hasInitialLoadCompletedRef.current = true;
    clearLoadingState();
  }, [clearLoadingState]);

  const handleLoadProgress = useCallback(
    (event: WebViewProgressEvent) => {
      if (event.nativeEvent.progress >= 0.98) {
        handleLoadEnd();
      }
    },
    [handleLoadEnd],
  );

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      if (loadingFallbackTimerRef.current) {
        clearTimeout(loadingFallbackTimerRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    clearLoadingState,
    handleLoadStart,
    handleLoadEnd,
    handleLoadProgress,
  };
}
