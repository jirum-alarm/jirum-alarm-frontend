import {useWebviewContext} from '@/provider/WebViewRefProvider';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTokenRemoveEffect} from './useTokenRemoveEffect';
import {SERVICE_URL} from '@/constants/env';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert, Animated, BackHandler, useAnimatedValue} from 'react-native';
import {openInAppBrowser} from '@/shared/lib/navigation';
import type {WebViewMessageEvent} from 'react-native-webview';
import {
  ShouldStartLoadRequest,
  WebViewProgressEvent,
} from 'react-native-webview/lib/WebViewTypes';
import {
  parsedWebViewMessage,
  WebViewEventPayloads,
  WebViewEventType,
} from '@/shared/lib/webview';
import {
  CommonActions,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainParamList} from '@/navigations/stack/MainNavigator';
import {mainNavigations} from '@/shared/constant/navigations';

const LOADING_INDICATOR_DELAY_MS = 1000;
const LOADING_FALLBACK_TIMEOUT_MS = 15000;

/**
 * AdSense 광고가 일으키는 호스트들. iOS는 onShouldStartLoadWithRequest가
 * 광고 iframe 로드/리다이렉트(googlesyndication·doubleclick 등)에도 실행되는데,
 * 이게 외부 URL로 분류돼 openInAppBrowser를 트리거하면 탭 이동마다 모달 브라우저가 떴다.
 * 이 호스트들은 사용자가 누른 링크가 아니라 광고 스크립트의 내부 동작이므로
 * WebView가 그대로 처리하도록 통과시키고 인앱 브라우저로 보내지 않는다.
 */
const AD_HOST_FRAGMENTS = [
  'googlesyndication.com',
  'doubleclick.net',
  'googleadservices.com',
  'googleads.g.doubleclick.net',
  'google.com/pagead',
  'google.com/ads',
  'adservice.google',
  'pagead2.googlesyndication.com',
];

const isAdRequestUrl = (url: string) =>
  AD_HOST_FRAGMENTS.some(fragment => url.includes(fragment));

export function useCommonWebViewLogic() {
  const insets = useSafeAreaInsets();
  const {webviewRef} = useWebviewContext();

  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        MainParamList,
        typeof mainNavigations.JIRUM_ALARM_WEBVIEW
      >
    >();

  useTokenRemoveEffect();

  const [navState, setNavState] = useState({url: '', canGoBack: false});
  const bgAnimation = useAnimatedValue(0);
  const [isScroll, setIsScroll] = useState(false);
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

  // 컴포넌트 언마운트 시 타이머 정리
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

  /**
   * onShouldStartLoadWithRequest는 IOS의 경우 모든 URL 로드시에 실행
   * Android의 경우 클릭시에만 이벤트 실행
   */
  const handleShouldStartLoadWithRequest = useCallback(
    (event: ShouldStartLoadRequest) => {
      // about:blank는 WebView 초기화 시 발생
      if (event.url === 'about:blank') {
        return true;
      }

      // AdSense 광고가 일으키는 로드(googlesyndication·doubleclick 등)는
      // 사용자가 누른 링크가 아니므로 인앱 브라우저로 보내지 않고 WebView가 처리한다.
      // (이게 없으면 탭 이동마다 광고 로드가 외부 URL로 분류돼 모달 브라우저가 떴다.)
      if (isAdRequestUrl(event.url)) {
        return true;
      }

      if (
        !event.url.includes('jirum-alarm') &&
        !event.url.startsWith(SERVICE_URL)
      ) {
        clearLoadingState();
        openInAppBrowser(event.url);
        return false;
      }
      if (event.url.startsWith('https://about-us.jirum-alarm.com')) {
        clearLoadingState();
        openInAppBrowser(event.url);
        return false;
      }
      return true;
    },
    [clearLoadingState],
  );

  const closeApp = useCallback(() => {
    Alert.alert('종료 확인', '앱을 종료하시겠습니까?', [
      {text: '취소', onPress: () => {}, style: 'cancel'},
      {text: '확인', onPress: () => BackHandler.exitApp()},
    ]);
  }, []);

  useEffect(() => {
    const handleBackPress = () => {
      if (navState.canGoBack && webviewRef?.current) {
        if (navState.url === `${SERVICE_URL}/`) {
          closeApp();
        } else {
          webviewRef.current.goBack();
        }
      } else {
        closeApp();
      }
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
  }, [webviewRef, navState, closeApp]);

  const shouldDarkStatusBar = useMemo(
    () => navState.url === `${SERVICE_URL}/` && !isScroll,
    [navState.url, isScroll],
  );

  useEffect(() => {
    Animated.timing(bgAnimation, {
      toValue: shouldDarkStatusBar ? 0 : 1,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [navState.url, bgAnimation, shouldDarkStatusBar]);

  const handleNavigationStateChange = (event: WebViewMessageEvent) => {
    const parsedMessage = parsedWebViewMessage(event);

    if (parsedMessage.type === WebViewEventType.ROUTE_CHANGED) {
      if (parsedMessage.payload?.data) {
        const {url, type} = parsedMessage.payload
          .data as WebViewEventPayloads[WebViewEventType.ROUTE_CHANGED]['data'];

        if (type === 'push') {
          navigation.dispatch(
            StackActions.push(mainNavigations.JIRUM_ALARM_WEBVIEW, {uri: url}),
          );
        } else if (type === 'replace') {
          navigation.dispatch(
            CommonActions.navigate(mainNavigations.JIRUM_ALARM_WEBVIEW, {
              uri: url,
            }),
          );
        }
      }
    }

    if (parsedMessage.type === WebViewEventType.PRESS_BACKBUTTON) {
      navigation.goBack();
    }
  };

  return {
    insets,
    webviewRef,
    navState,
    setNavState,
    bgAnimation,
    isScroll,
    setIsScroll,
    handleShouldStartLoadWithRequest,
    handleNavigationStateChange,
    shouldDarkStatusBar,
    isLoading,
    handleLoadStart,
    handleLoadEnd,
    handleLoadProgress,
  };
}
