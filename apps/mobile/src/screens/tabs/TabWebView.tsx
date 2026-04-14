import WebView from 'react-native-webview';
import {handleWebViewMessage} from '@/shared/lib/webview';
import {
  Platform,
  StyleSheet,
  View,
  Animated,
  ScrollView,
  RefreshControl,
} from 'react-native';
import React, {useState, useCallback, useRef, useEffect} from 'react';
import {SERVICE_URL, USER_AGENT} from '@/constants/env';
import {SystemBars} from 'react-native-edge-to-edge';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useWebviewContext} from '@/provider/WebViewRefProvider';
import {tabNavigations} from '@/shared/constant/navigations';
import {useTokenRemoveEffect} from '@/screens/jirumalarmwebview/hooks/useTokenRemoveEffect';
import {openInAppBrowser} from '@/shared/lib/navigation';
import * as Haptics from 'expo-haptics';
import {TabSkeleton} from '@/shared/components/skeleton/TabSkeleton';
import type {
  ShouldStartLoadRequest,
  WebViewProgressEvent,
} from 'react-native-webview/lib/WebViewTypes';
import {useIsFocused} from '@react-navigation/native';
import {isTabRootUrl} from '@/shared/lib/navigation/tab-routing';
import {setTabBarVisible} from '@/shared/hooks/useTabBarVisibility';

type TabName = (typeof tabNavigations)[keyof typeof tabNavigations];

interface TabWebViewProps {
  tabName: TabName;
  baseUrl: string;
}

const LOADING_INDICATOR_DELAY_MS = 1000;
const LOADING_FALLBACK_TIMEOUT_MS = 15000;

/** 네이티브 탭에서 웹 바텀 내비를 숨기기 위해 주입하는 JS */
const INJECT_HIDE_WEB_BOTTOM_NAV = `
  (function() {
    document.documentElement.dataset.nativeTabs = 'true';
    var style = document.createElement('style');
    style.textContent = '[data-native-tabs="true"] nav { display: none !important; }';
    document.head.appendChild(style);
  })();
  true;
`;

function useLoadingState() {
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

function useUrlFilter(clearLoadingState: () => void) {
  return useCallback(
    (event: ShouldStartLoadRequest) => {
      if (event.url === 'about:blank') {
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
    handleLoadStart,
    handleLoadEnd,
    handleLoadProgress,
  } = useLoadingState();
  const handleShouldStartLoadWithRequest = useUrlFilter(clearLoadingState);

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

  return {
    insets,
    isFocused,
    webviewRef,
    navState,
    setNavState,
    bgAnimation,
    isLoading,
    isHomeTab,
    shouldDarkStatusBar,
    handleLoadStart,
    handleLoadEnd,
    handleLoadProgress,
    handleShouldStartLoadWithRequest,
    handleScrollForHomeStatusBar,
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
    shouldDarkStatusBar,
    handleLoadStart,
    handleLoadEnd,
    handleLoadProgress,
    handleShouldStartLoadWithRequest,
    handleScrollForHomeStatusBar,
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
          injectedJavaScript={INJECT_HIDE_WEB_BOTTOM_NAV}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onLoadProgress={handleLoadProgress}
          onError={handleLoadEnd}
          onHttpError={handleLoadEnd}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onContentProcessDidTerminate={() => webviewRef.current?.reload()}
          onMessage={handleWebViewMessage}
          onNavigationStateChange={state =>
            setNavState({url: state.url, canGoBack: state.canGoBack})
          }
          onScroll={e => {
            const scrollY = e.nativeEvent.contentOffset.y;
            setEnableRefresh(scrollY === 0);
            handleScrollForHomeStatusBar(scrollY);
          }}
        />
      </ScrollView>
      {isLoading && (
        <View style={styles.loadingContainer} pointerEvents="none">
          <TabSkeleton tabName={tabName} />
        </View>
      )}
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
    shouldDarkStatusBar,
    handleLoadStart,
    handleLoadEnd,
    handleLoadProgress,
    handleShouldStartLoadWithRequest,
    handleScrollForHomeStatusBar,
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
        injectedJavaScript={INJECT_HIDE_WEB_BOTTOM_NAV}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onLoadProgress={handleLoadProgress}
        onError={handleLoadEnd}
        onHttpError={handleLoadEnd}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onContentProcessDidTerminate={() => webviewRef.current?.reload()}
        onMessage={handleWebViewMessage}
        onNavigationStateChange={state =>
          setNavState({url: state.url, canGoBack: state.canGoBack})
        }
        allowsBackForwardNavigationGestures={true}
        onScroll={e => {
          const scrollY = e.nativeEvent.contentOffset.y;
          handleScrollForHomeStatusBar(scrollY);
        }}
      />
      {isLoading && (
        <View style={styles.loadingContainer} pointerEvents="none">
          <TabSkeleton tabName={tabName} />
        </View>
      )}
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
