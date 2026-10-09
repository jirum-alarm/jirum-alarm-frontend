import {useWebviewContext} from '@/provider/WebViewRefProvider';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTokenRemoveEffect} from './useTokenRemoveEffect';
import {SERVICE_URL} from '@/constants/env';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {Animated, BackHandler, Platform, useAnimatedValue} from 'react-native';
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
  useFocusEffect,
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

  /**
   * 안드로이드 뒤로가기 — 웹 기록이 있으면 웹에서 한 칸, 없으면 **스택에 넘긴다**(false).
   * 🔴예전엔 리스너를 해제하지 않았고 기록이 없으면 "앱을 종료할까요?" 를 띄웠다 —
   * 웹뷰 화면을 한 번 지나가면 남은 리스너가 다른 화면의 뒤로가기까지 가로채
   * 어디서 눌러도 종료 알럿이 떴다. 포커스된 동안만 듣는다.
   */
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (navState.canGoBack && webviewRef?.current) {
          webviewRef.current.goBack();
          return true;
        }
        return false;
      });
      return () => sub.remove();
    }, [webviewRef, navState.canGoBack]),
  );

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

        // ★탭 스택 라우트로 쌓는다 — 탭 스택 안(더보기로 들어온 /toss·/curation)이면
        // 탭바 숨김·뒤로가기가 탭 구조를 따르고, 탭 밖이면 루트 스택의 같은 이름(WEBVIEW)이 받는다.
        // 예전엔 탭 밖에서 JIRUM_ALARM_WEBVIEW 로 보냈는데 그 이름은 어느 스택에도 등록돼 있지 않아
        // dispatch 가 조용히 무시됐다(navigate 는 실패해도 안 던진다).
        const routeName = tabStackNavigations.WEBVIEW;

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
