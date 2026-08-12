import WebView from 'react-native-webview';
import {handleWebViewMessage} from '@/shared/lib/webview';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
  Animated,
  ScrollView,
  RefreshControl,
} from 'react-native';
import React, {useState, useCallback, useRef, useEffect, useMemo} from 'react';
import {SERVICE_URL, USER_AGENT} from '@/constants/env';
import {SystemBars} from 'react-native-edge-to-edge';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useWebviewContext} from '@/provider/WebViewRefProvider';
import {
  tabNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';
import {useTokenRemoveEffect} from '@/screens/jirumalarmwebview/hooks/useTokenRemoveEffect';
import {useWebViewLoading} from '@/screens/jirumalarmwebview/hooks/useWebViewLoading';
import WebViewErrorView from '@/shared/components/WebViewErrorView';
import {openInAppBrowser, shouldOpenExternally} from '@/shared/lib/navigation';
import * as Haptics from 'expo-haptics';
import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  getPushablePath,
  isTabRootUrl,
} from '@/shared/lib/navigation/tab-routing';
import type {TabStackParamList} from '@/navigations/tab/types';
import {setTabBarVisible} from '@/shared/hooks/useTabBarVisibility';
import {getReservedBottomPx} from '@/navigations/tab/MainTabNavigator';
import {DEVICE_ID_SYNC_SCRIPT} from '@/shared/lib/device/device-id';
import {INTERCEPT_DETAIL_LINK_SCRIPT} from '@/shared/lib/webview/intercept-detail-link';
import {setOpenDetailListener} from '@/shared/lib/webview/event';

type TabName = (typeof tabNavigations)[keyof typeof tabNavigations];

type TabStackNavigationProp = NativeStackNavigationProp<TabStackParamList>;

interface TabWebViewProps {
  tabName: TabName;
  baseUrl: string;
}

/**
 * 네이티브 탭에서 웹 바텀 내비를 숨기기 위해 주입하는 JS.
 *
 * 유리 탭바(iOS 26)는 캡슐이 바닥에서 떠 있어 웹 기본값(56px + safe-area)보다
 * 더 높은 자리를 차지한다. 그대로 두면 마지막 콘텐츠가 캡슐 밑으로 들어가므로
 * 실제 탭바 높이를 --bottom-nav-padding 으로 넘겨 웹이 여백을 맞추게 한다.
 *
 * ⚠️ 첫 페인트 전에 스타일이 박혀야 한다. 로드 완료 후에 넣으면 웹 네비가
 * 한 프레임 그려졌다 사라지는 깜빡임이 보인다(injectedJavaScriptBeforeContentLoaded
 * 로도 함께 주입하는 이유). 그 시점엔 <head> 가 아직 없을 수 있어
 * documentElement 에 붙이고, 중복 주입은 id 로 막는다.
 */
const buildHideWebBottomNavJs = (reservedBottomPx: number) => `
  (function() {
    var STYLE_ID = 'jirum-native-tabs';
    document.documentElement.dataset.nativeTabs = 'true';
    if (document.getElementById(STYLE_ID)) { return; }
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '[data-native-tabs="true"] nav { display: none !important; }' +
      ':root { --bottom-nav-padding: ${reservedBottomPx}px !important; }';
    (document.head || document.documentElement).appendChild(style);
  })();
  true;
`;

/**
 * SPA(Next.js) 클라이언트 라우팅으로 상세에 들어간 경우를 잡아 네이티브로 올린다.
 *
 * onShouldStartLoadWithRequest 는 "문서 로드"에만 발화한다. 웹이 pushState 로
 * URL 만 바꾸면 그 필터를 타지 않아 상세가 웹뷰 안에서 그려진다 — 광고까지 그대로.
 * onNavigationStateChange 는 pushState 도 잡으므로 여기서 한 번 더 건진다.
 *
 * 이미 push 한 경로는 다시 올리지 않는다(뒤로가기로 돌아왔을 때 무한 push 방지).
 */
function useSpaDetailPush() {
  const navigation = useNavigation<TabStackNavigationProp>();
  const lastPushedRef = useRef<string | null>(null);

  return useCallback(
    (url: string) => {
      const pushablePath = getPushablePath(url);
      if (!pushablePath) {
        // 상세를 벗어나면 기록을 비워 다음 진입을 허용한다.
        lastPushedRef.current = null;
        return;
      }
      if (lastPushedRef.current === pushablePath) return;
      lastPushedRef.current = pushablePath;

      // 클릭 가로채기(INTERCEPT_DETAIL_LINK_SCRIPT)가 이미 웹 이동을 막았으면
      // 웹뷰는 탭 루트 그대로다. 여기서 goBack 을 부르면 오히려 한 단계 더
      // 뒤로 가버린다 — 폴백 경로에서만 웹이 움직였을 수 있어 URL 로 판별한다.
      navigation.push(tabStackNavigations.DETAIL, {path: pushablePath});
    },
    [navigation],
  );
}

function useUrlFilter(clearLoadingState: () => void) {
  const navigation = useNavigation<TabStackNavigationProp>();

  return useCallback(
    (event: ShouldStartLoadRequest) => {
      if (shouldOpenExternally(event)) {
        clearLoadingState();
        openInAppBrowser(event.url);
        return false;
      }

      // 상세는 같은 WebView 에서 URL 을 갈아끼우지 않고 스택에 push 한다.
      // 그래야 전환 중 이전 화면이 남아 흰 화면이 안 뜬다.
      // iOS 는 사용자 탭이 아닌 로드(리다이렉트 등)까지 잡히면 곤란하므로
      // 메인 프레임 클릭만 대상으로 한다.
      // Android 는 navigationType 이 항상 'other' 라 click 을 요구하면 영영 안 걸린다.
      // iOS 만 사용자 탭 여부를 구분할 수 있다(in-app-browser 와 같은 패턴).
      const isUserInitiated =
        Platform.OS !== 'ios' || event.navigationType === 'click';
      if (event.isTopFrame !== false && isUserInitiated) {
        const pushablePath = getPushablePath(event.url);
        if (pushablePath) {
          clearLoadingState();
          navigation.push(tabStackNavigations.DETAIL, {path: pushablePath});
          return false;
        }
      }

      return true;
    },
    [clearLoadingState, navigation],
  );
}

function useTabWebViewCommon({tabName}: {tabName: TabName}) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const webviewRef = useRef<WebView>(null);
  const {registerWebViewRef, unregisterWebViewRef} = useWebviewContext();

  useTokenRemoveEffect();

  const [navState, setNavState] = useState({url: '', canGoBack: false});
  const bgAnimation = React.useRef(new Animated.Value(0)).current;
  const [isScroll, setIsScroll] = useState(false);

  const {
    isLoading,
    clearLoadingState,
    handleLoadStart: startLoading,
    handleLoadEnd,
    handleLoadProgress,
  } = useWebViewLoading();
  const handleShouldStartLoadWithRequest = useUrlFilter(clearLoadingState);
  const handleSpaDetailPush = useSpaDetailPush();

  // 웹뷰 안에서 가로챈 상세 클릭을 이 탭의 스택으로 보낸다.
  useFocusEffect(
    useCallback(() => {
      setOpenDetailListener(handleSpaDetailPush);
      return () => setOpenDetailListener(null);
    }, [handleSpaDetailPush]),
  );

  // 메인 프레임 로드 실패(네트워크 끊김 등)만 잡는다. HTTP 에러는 web이 렌더.
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
    webviewRef.current?.reload();
  }, []);

  useEffect(() => {
    registerWebViewRef(tabName, webviewRef);
    return () => unregisterWebViewRef(tabName);
  }, [tabName, registerWebViewRef, unregisterWebViewRef]);

  const isHomePage = navState.url === `${SERVICE_URL}/`;
  const isHomeTab = tabName === tabNavigations.HOME;
  const shouldDarkStatusBar = isHomeTab && isHomePage && !isScroll;

  // 포커스된 탭의 URL에 따라 탭바 표시/숨김
  useEffect(() => {
    if (isFocused && navState.url) {
      setTabBarVisible(isTabRootUrl(navState.url));
    }
  }, [isFocused, navState.url]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }
    Animated.timing(bgAnimation, {
      toValue: shouldDarkStatusBar ? 0 : 1,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [shouldDarkStatusBar, bgAnimation, isFocused]);

  const handleScrollForHomeStatusBar = useCallback(
    (scrollY: number) => {
      if (isHomeTab && isHomePage) {
        if (scrollY > 100 && !isScroll) {
          setIsScroll(true);
        } else if (scrollY < 100 && isScroll) {
          setIsScroll(false);
        }
      }
    },
    [isHomeTab, isHomePage, isScroll],
  );

  // 웹이 확보해야 할 하단 여백. 네이티브 탭바 높이와 짝이라 여기서 한 번만 계산한다.
  // deviceId 동기화도 같이 태운다 — 네이티브 상세가 조회 수집을 직접 하므로
  // 웹뷰가 쓰던 것과 같은 식별자를 받아와야 집계가 둘로 쪼개지지 않는다.
  const injectedHideWebBottomNavJs = useMemo(
    () =>
      buildHideWebBottomNavJs(getReservedBottomPx(insets.bottom)) +
      DEVICE_ID_SYNC_SCRIPT +
      INTERCEPT_DETAIL_LINK_SCRIPT,
    [insets.bottom],
  );

  return {
    insets,
    isFocused,
    webviewRef,
    navState,
    setNavState,
    bgAnimation,
    isLoading,
    isHomeTab,
    injectedHideWebBottomNavJs,
    shouldDarkStatusBar,
    handleLoadStart,
    handleLoadEnd,
    handleLoadProgress,
    handleShouldStartLoadWithRequest,
    handleSpaDetailPush,
    handleScrollForHomeStatusBar,
    hasError,
    handleError,
    retry,
  };
}

function useAndroidRefreshLogic(webviewRef: React.RefObject<WebView | null>) {
  const [refreshing, setRefreshing] = useState(false);
  const [enableRefresh, setEnableRefresh] = useState(false);

  const onRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRefreshing(true);
    webviewRef.current?.reload();
    setTimeout(() => setRefreshing(false), 1000);
  }, [webviewRef]);

  return {refreshing, enableRefresh, setEnableRefresh, onRefresh};
}

const TabWebViewAndroid = ({tabName, baseUrl}: TabWebViewProps) => {
  const {
    insets,
    isFocused,
    webviewRef,
    setNavState,
    bgAnimation,
    isLoading,
    isHomeTab,
    injectedHideWebBottomNavJs,
    shouldDarkStatusBar,
    handleLoadStart,
    handleLoadEnd,
    handleLoadProgress,
    handleShouldStartLoadWithRequest,
    handleSpaDetailPush,
    handleScrollForHomeStatusBar,
    hasError,
    handleError,
    retry,
  } = useTabWebViewCommon({tabName});

  const {refreshing, enableRefresh, setEnableRefresh, onRefresh} =
    useAndroidRefreshLogic(webviewRef);

  return (
    <View style={styles.container}>
      {isFocused && (
        <SystemBars
          style={shouldDarkStatusBar ? 'light' : 'dark'}
          hidden={false}
        />
      )}
      <Animated.View
        pointerEvents="none"
        style={{
          height: insets.top,
          backgroundColor: isHomeTab
            ? bgAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['#101828', '#ffffff'],
              })
            : '#ffffff',
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            enabled={enableRefresh}
            onRefresh={onRefresh}
          />
        }>
        <WebView
          ref={webviewRef}
          sharedCookiesEnabled={true}
          pullToRefreshEnabled
          decelerationRate={0.998}
          source={{uri: `${SERVICE_URL}${baseUrl}`}}
          applicationNameForUserAgent={USER_AGENT}
          setSupportMultipleWindows={false}
          webviewDebuggingEnabled={__DEV__}
          injectedJavaScriptBeforeContentLoaded={injectedHideWebBottomNavJs}
          injectedJavaScript={injectedHideWebBottomNavJs}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onLoadProgress={handleLoadProgress}
          onError={handleError}
          onHttpError={handleLoadEnd}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onContentProcessDidTerminate={() => webviewRef.current?.reload()}
          onMessage={handleWebViewMessage}
          onNavigationStateChange={state => {
            setNavState({url: state.url, canGoBack: state.canGoBack});
            handleSpaDetailPush(state.url);
          }}
          onScroll={e => {
            const scrollY = e.nativeEvent.contentOffset.y;
            setEnableRefresh(scrollY === 0);
            handleScrollForHomeStatusBar(scrollY);
          }}
        />
      </ScrollView>
      {isLoading && (
        <View style={styles.loadingContainer} pointerEvents="none">
          <ActivityIndicator size="small" color="#667085" />
        </View>
      )}
      {hasError && <WebViewErrorView onRetry={retry} />}
    </View>
  );
};

const TabWebViewIOS = ({tabName, baseUrl}: TabWebViewProps) => {
  const {
    insets,
    isFocused,
    webviewRef,
    setNavState,
    bgAnimation,
    isLoading,
    isHomeTab,
    injectedHideWebBottomNavJs,
    shouldDarkStatusBar,
    handleLoadStart,
    handleLoadEnd,
    handleLoadProgress,
    handleShouldStartLoadWithRequest,
    handleSpaDetailPush,
    handleScrollForHomeStatusBar,
    hasError,
    handleError,
    retry,
  } = useTabWebViewCommon({tabName});

  return (
    <View style={styles.container}>
      {isFocused && (
        <SystemBars
          style={shouldDarkStatusBar ? 'light' : 'dark'}
          hidden={false}
        />
      )}
      <Animated.View
        pointerEvents="none"
        style={{
          height: insets.top,
          backgroundColor: isHomeTab
            ? bgAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['#101828', '#ffffff'],
              })
            : '#ffffff',
        }}
      />
      <WebView
        ref={webviewRef}
        sharedCookiesEnabled={true}
        pullToRefreshEnabled={true}
        decelerationRate={1.0}
        source={{uri: `${SERVICE_URL}${baseUrl}`}}
        applicationNameForUserAgent={USER_AGENT}
        setSupportMultipleWindows={false}
        injectedJavaScriptBeforeContentLoaded={injectedHideWebBottomNavJs}
        injectedJavaScript={injectedHideWebBottomNavJs}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onLoadProgress={handleLoadProgress}
        onError={handleError}
        onHttpError={handleLoadEnd}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onContentProcessDidTerminate={() => webviewRef.current?.reload()}
        onMessage={handleWebViewMessage}
        onNavigationStateChange={state => {
          setNavState({url: state.url, canGoBack: state.canGoBack});
          handleSpaDetailPush(state.url);
        }}
        allowsBackForwardNavigationGestures={true}
        onScroll={e => {
          const scrollY = e.nativeEvent.contentOffset.y;
          handleScrollForHomeStatusBar(scrollY);
        }}
      />
      {isLoading && (
        <View style={styles.loadingContainer} pointerEvents="none">
          <ActivityIndicator size="small" color="#667085" />
        </View>
      )}
      {hasError && <WebViewErrorView onRetry={retry} />}
    </View>
  );
};

const TabWebView = Platform.select({
  android: TabWebViewAndroid,
  ios: TabWebViewIOS,
  default: TabWebViewIOS,
})!;

export default TabWebView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});
