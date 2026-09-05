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
import {navigateToTrending} from '@/navigations/navigation-ref';
import {
  getPushablePath,
  isTabRootUrl,
} from '@/shared/lib/navigation/tab-routing';
import type {TabStackParamList} from '@/navigations/tab/types';
import {setTabBarVisibleFromUrl} from '@/shared/hooks/useHideTabBar';
import {
  buildNativeTabsInjectJs,
  getFabPaddingPx,
  getReservedBottomPx,
  getWebBottomNavVars,
  isIos26SystemTabBar,
} from '@/navigations/tab/tab-bar-metrics';
import {DEVICE_ID_SYNC_SCRIPT} from '@/shared/lib/device/device-id';
import {INTERCEPT_DETAIL_LINK_SCRIPT} from '@/shared/lib/webview/intercept-detail-link';
import {subscribeOpenDetail} from '@/shared/lib/webview/event';
import {SCREEN_BACKGROUND_COLOR} from '@/navigations/tab/native-headers';

type TabName = (typeof tabNavigations)[keyof typeof tabNavigations];

type TabStackNavigationProp = NativeStackNavigationProp<TabStackParamList>;

interface TabWebViewProps {
  tabName: TabName;
  baseUrl: string;
}

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
  const lastPushedRef = useRef<{path: string; at: number} | null>(null);

  return useCallback(
    (url: string) => {
      const pushablePath = getPushablePath(url);
      if (!pushablePath) {
        lastPushedRef.current = null;
        // SPA 로 발견 탭에 들어간 경우도 네이티브로 올린다(위 URL 필터와 짝).
        navigateToTrending(url);
        return;
      }
      // ★ 시간 기반 dedup.
      // 경로만으로 막으면 같은 상품을 다시 못 연다 — 클릭 가로채기가 웹 이동을
      // 막아서 "상세를 벗어났다"는 통지가 영영 안 오고 기록이 안 지워지기 때문.
      // 중복 통지는 수백 ms 안에 몰려 오므로 짧은 창으로만 막으면 충분하다.
      const now = Date.now();
      const last = lastPushedRef.current;
      if (last && last.path === pushablePath && now - last.at < 700) return;
      lastPushedRef.current = {path: pushablePath, at: now};

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

        // ★발견 탭(`/trending/*`)은 네이티브 화면이다. 웹뷰 안에서 열게 두면
        // 같은 목록이 두 벌로 보이고(웹 버전은 이제 낡는다) 탭 아이콘과
        // 내용이 어긋난다 — 유저는 이걸 버그로 읽는다.
        if (navigateToTrending(event.url)) {
          clearLoadingState();
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
      const unsubscribe = subscribeOpenDetail(handleSpaDetailPush);
      return unsubscribe;
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

  // 포커스된 탭의 URL에 따라 탭바 표시/숨김.
  // ★setTabBarVisible 을 직접 부르면 hideCount 를 무시해서, 숨김 화면이
  // 남아 있는데 켜버리거나 웹뷰가 꺼둔 걸 아무도 못 되돌린다.
  useEffect(() => {
    if (isFocused && navState.url) {
      setTabBarVisibleFromUrl(isTabRootUrl(navState.url));
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

  const reservedBottomPx = getReservedBottomPx(insets.bottom);
  // ★iOS 26 시스템 탭바는 웹뷰 위에서 실제로 사라지지 않는다.
  // 숨김은 clip(화면을 탭바 높이만큼 내려 잘라내기)으로만 되는데, 웹뷰 안 SPA 는
  // tabBarClipWhenHidden 을 끈 상태다(자르면 댓글 입력창 아래가 빈다).
  // 그래서 여백을 0 으로 알려주면 커뮤니티 글 댓글 입력창이 탭바 뒤로 깔린다.
  const tabBarVisible =
    isIos26SystemTabBar() || !navState.url || isTabRootUrl(navState.url);
  const fabPaddingPx = tabBarVisible ? getFabPaddingPx(insets.bottom) : 0;
  const bottomNavVars = useMemo(
    () =>
      getWebBottomNavVars({
        tabBarVisible,
        reservedBottomPx,
        safeAreaBottom: insets.bottom,
        fabPaddingPx,
      }),
    [tabBarVisible, reservedBottomPx, insets.bottom, fabPaddingPx],
  );

  const injectedHideWebBottomNavJs = useMemo(
    () =>
      buildNativeTabsInjectJs(bottomNavVars) +
      DEVICE_ID_SYNC_SCRIPT +
      INTERCEPT_DETAIL_LINK_SCRIPT,
    [bottomNavVars],
  );

  useEffect(() => {
    if (!navState.url) return;
    webviewRef.current?.injectJavaScript(
      buildNativeTabsInjectJs(bottomNavVars),
    );
  }, [navState.url, bottomNavVars]);

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
    backgroundColor: SCREEN_BACKGROUND_COLOR,
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
    // 반투명이면 아직 아무것도 안 그린 WebView 가 비쳐서 덮는 의미가 없다.
    backgroundColor: SCREEN_BACKGROUND_COLOR,
  },
});
