import {useCallback, useEffect, useRef, useState} from 'react';
import type {WebViewProgressEvent} from 'react-native-webview/lib/WebViewTypes';

const LOADING_FALLBACK_TIMEOUT_MS = 15000;

/**
 * WebView 첫 진입 로딩 오버레이 상태 관리.
 * 상세(useCommonWebViewLogic)·탭(TabWebView) 두 화면이 동일 로직을 복붙해 쓰던 것을
 * 하나로 추출. 첫 로드에서만 오버레이를 덮고, 15초 fallback으로 강제 해제.
 *
 * ⚠️ 예전엔 오버레이를 1초 지연시켰다(빠른 로드에서 스피너가 번쩍이는 걸 피하려고).
 * 그런데 화면이 push 되는 순간 WebView 는 아직 아무것도 안 그린 상태라, 그 1초가
 * 통째로 흰 화면이었다 — 지연이 스피너 깜빡임 대신 흰 화면을 산 셈. 지금은
 * 마운트 즉시(첫 로드 한정) 흰 배경으로 덮고, 페인트가 끝나면 걷어낸다.
 */
export function useWebViewLoading() {
  // 첫 진입은 무조건 덮은 채로 시작한다. onLoadEnd/progress 가 걷어낸다.
  const [isLoading, setIsLoading] = useState(true);
  const loadingFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const hasInitialLoadCompletedRef = useRef(false);

  const clearLoadingState = useCallback(() => {
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
    if (loadingFallbackTimerRef.current) {
      clearTimeout(loadingFallbackTimerRef.current);
    }
    setIsLoading(true);
    // 페인트 신호(onLoadEnd·progress)가 끝내 안 오는 경우를 대비한 강제 해제.
    loadingFallbackTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      loadingFallbackTimerRef.current = null;
    }, LOADING_FALLBACK_TIMEOUT_MS);
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
