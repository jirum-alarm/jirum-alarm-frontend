import {useWebviewContext} from '@/provider/WebViewRefProvider';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTokenRemoveEffect} from './useTokenRemoveEffect';
import {SERVICE_URL} from '@/constants/env';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Platform,
  useAnimatedValue,
} from 'react-native';
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
import {
  mainNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';
import {isInTabStack} from '@/shared/lib/navigation/search-flow';
import {getPushablePath} from '@/shared/lib/navigation/tab-routing';

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

      // ★문서 로드로 상품 상세에 가는 경우도 네이티브로 올린다.
      // (위 ROUTE_CHANGED 는 web 의 SPA 라우팅만 잡는다)
      // iOS 는 사용자 탭이 아닌 로드까지 잡히면 곤란해 click 만 대상으로 한다 —
      // Android 는 navigationType 이 항상 'other' 라 구분이 안 된다.
      const isUserInitiated =
        Platform.OS !== 'ios' || event.navigationType === 'click';
      if (event.isTopFrame !== false && isUserInitiated) {
        const pushablePath = getPushablePath(event.url);
        if (pushablePath && isInTabStack(navigation)) {
          clearLoadingState();
          navigation.dispatch(
            StackActions.push(tabStackNavigations.DETAIL, {
              path: pushablePath,
            }),
          );
          return false;
        }
      }

      return true;
    },
    [clearLoadingState, navigation],
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

        // ★상품 상세는 웹뷰로 쌓지 않고 **네이티브 상세**로 올린다.
        // 토스 특가 웹뷰에서 상품을 누르면 웹뷰가 또 쌓여서 네이티브 상세의
        // CTA·차트·공유가 전부 사라진다(사용자 지적). TabWebView 가 이미
        // 같은 판정을 쓴다(getPushablePath).
        const pushablePath = getPushablePath(url);
        if (pushablePath && isInTabStack(navigation)) {
          navigation.dispatch(
            StackActions.push(tabStackNavigations.DETAIL, {
              path: pushablePath,
            }),
          );
          return;
        }

        // ★어느 스택에서 열렸느냐에 따라 라우트 이름이 다르다.
        // 탭 스택 안(더보기로 들어온 /toss·/curation)이면 탭 스택 라우트로
        // 쌓아야 탭바 숨김·뒤로가기가 탭 구조를 따른다. MainStack 라우트로
        // 쌓으면 탭 밖으로 나가 **하단 탭바가 다시 뜬다**(사용자 지적).
        const routeName = isInTabStack(navigation)
          ? tabStackNavigations.WEBVIEW
          : mainNavigations.JIRUM_ALARM_WEBVIEW;

        if (type === 'push') {
          navigation.dispatch(StackActions.push(routeName, {uri: url}));
        } else if (type === 'replace') {
          navigation.dispatch(CommonActions.navigate(routeName, {uri: url}));
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
