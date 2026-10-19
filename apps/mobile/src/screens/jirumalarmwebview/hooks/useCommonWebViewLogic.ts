import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTokenRemoveEffect} from './useTokenRemoveEffect';
import {SERVICE_URL} from '@/constants/env';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, BackHandler, Platform, useAnimatedValue} from 'react-native';
import {openInAppBrowser, shouldOpenExternally} from '@/shared/lib/navigation';
import type WebView from 'react-native-webview';
import type {WebViewMessageEvent} from 'react-native-webview';
import {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';
import {useWebViewLoading} from './useWebViewLoading';
import {
  handleWebViewMessage,
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
import {navigateToNativeRoute} from '@/shared/lib/navigation/navigation-ref';

export function useCommonWebViewLogic() {
  const insets = useSafeAreaInsets();
  // ★이 화면 자신의 WebView 를 가리키는 ref. 예전엔 WebViewRefProvider 의 webviewRef 를 꽂았는데
  // 그건 "활성 탭 웹뷰"를 돌려주는 읽기 전용 프록시(set 은 no-op)라 여기선 늘 null 이었다 —
  // 다시 시도·당겨서 새로고침·WebKit 종료 복구·하드웨어 뒤로가기의 웹 history 이동이 전부 무반응.
  const webviewRef = useRef<WebView>(null);

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
        // 네이티브 화면이 있는 서비스 경로(홈·발견·커뮤니티·테마 등)는 그 화면으로 연다.
        // 없으면 사용법(/help) 기능 카드를 눌렀을 때 웹 홈·랭킹이 이 웹뷰 안에 그대로 떴다.
        // 네이티브가 없는 경로(/keywords 목록·/guide 등)는 null 이라 지금처럼 웹뷰가 읽는다.
        if (
          event.url.startsWith(SERVICE_URL) &&
          navigateToNativeRoute(event.url)
        ) {
          clearLoadingState();
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

  /**
   * 이 화면의 onMessage — Android·iOS 가 같은 걸 쓴다.
   *
   * ★PRESS_BACKBUTTON 은 전역 브리지로 넘기지 않는다. 전역 처리가 `BackHandler.exitApp()` 이라
   * 예전 Android(전역 브리지만 불렀다)는 웹 「뒤로 가기」를 누르면 **앱이 꺼졌다.**
   * iOS 는 exitApp 이 아무 일도 안 해 드러나지 않았다. pop 은 위 핸들러 한 곳에서만 한다(두 번 pop 금지).
   */
  const handleMessage = (event: WebViewMessageEvent) => {
    let type: WebViewEventType;
    try {
      type = parsedWebViewMessage(event).type;
    } catch {
      return; // JSON 이 아닌 메시지(서드파티 스크립트 등) — 전역 브리지도 버린다
    }
    if (type !== WebViewEventType.PRESS_BACKBUTTON) {
      handleWebViewMessage(event);
    }
    handleNavigationStateChange(event);
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
    handleMessage,
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
