import {useWebviewContext} from '@/provider/WebViewRefProvider';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTokenRemoveEffect} from './useTokenRemoveEffect';
import {SERVICE_URL} from '@/constants/env';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, Animated, BackHandler, useAnimatedValue} from 'react-native';
import {openInAppBrowser, shouldOpenExternally} from '@/shared/lib/navigation';
import type {WebViewMessageEvent} from 'react-native-webview';
import {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';
import {useWebViewLoading} from './useWebViewLoading';
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
  const {
    isLoading,
    clearLoadingState,
    handleLoadStart: startLoading,
    handleLoadEnd,
    handleLoadProgress,
  } = useWebViewLoading();

  // 메인 프레임 로드 자체가 실패한 경우(네트워크 끊김·DNS·타임아웃 등)만 잡는다.
  // 이땐 web JS가 실행조차 안 돼 web의 에러 UI가 못 뜨고 빈 화면이 된다.
  // 서버 HTTP 에러(onHttpError)는 web의 global-error/ServerError가 렌더하므로 건드리지 않는다.
  const [hasError, setHasError] = useState(false);

  const handleLoadStart = useCallback(() => {
    setHasError(false);
    startLoading();
  }, [startLoading]);

  const handleError = useCallback(() => {
    handleLoadEnd();
    setHasError(true);
  }, [handleLoadEnd]);

  const retry = useCallback(() => {
    setHasError(false);
    webviewRef?.current?.reload();
  }, [webviewRef]);

  /**
   * onShouldStartLoadWithRequest는 IOS의 경우 모든 URL 로드시에 실행
   * Android의 경우 클릭시에만 이벤트 실행
   */
  const handleShouldStartLoadWithRequest = useCallback(
    (event: ShouldStartLoadRequest) => {
      if (shouldOpenExternally(event)) {
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
    hasError,
    handleError,
    retry,
  };
}
