import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {ActivityIndicator, Platform, StyleSheet, View} from 'react-native';
import WebView from 'react-native-webview';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SystemBars} from 'react-native-edge-to-edge';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

import {SERVICE_URL, USER_AGENT} from '@/constants/env';
import {
  handleWebViewMessage,
  parsedWebViewMessage,
  WebViewEventType,
} from '@/shared/lib/webview';
import {subscribeOpenDetail} from '@/shared/lib/webview/event';
import {INTERCEPT_DETAIL_LINK_SCRIPT} from '@/shared/lib/webview/intercept-detail-link';
import {openInAppBrowser, shouldOpenExternally} from '@/shared/lib/navigation';
import {getPushablePath} from '@/shared/lib/navigation/tab-routing';
import WebViewErrorView from '@/shared/components/WebViewErrorView';
import {useTokenRemoveEffect} from '@/screens/jirumalarmwebview/hooks/useTokenRemoveEffect';
import {
  useHideTabBar,
  useHiddenTabBarClipPadding,
} from '@/shared/hooks/useHideTabBar';
import type {ProductFlowParamList} from '@/navigations/tab/types';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {getReservedBottomPx} from '@/navigations/tab/tab-bar-metrics';

type StackNav = Pick<
  NativeStackNavigationProp<ProductFlowParamList>,
  'push' | 'goBack'
>;

function isProductPath(path: string): boolean {
  return /^\/products\/\d+/.test(path.split(/[?#]/)[0]);
}

const NATIVE_STACK_SCRIPT = `
  (function() {
    document.documentElement.dataset.nativeStack = 'true';
    if (window.__jirumNativeStackBack) { return; }
    window.__jirumNativeStackBack = true;
    document.addEventListener('click', function(e) {
      var t = e.target;
      if (!t || !t.closest) { return; }
      var btn = t.closest('button[aria-label="뒤로 가기"]');
      if (!btn) { return; }
      e.preventDefault();
      e.stopPropagation();
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'PRESS_BACKBUTTON',
          payload: null
        }));
      }
    }, true);
  })();
  true;
`;

const HIDE_WEB_BOTTOM_NAV = `
  (function() {
    document.documentElement.dataset.nativeTabs = 'true';
    if (document.getElementById('jirum-native-tabs')) { return; }
    var style = document.createElement('style');
    style.id = 'jirum-native-tabs';
    style.textContent =
      '[data-native-tabs="true"] nav { display: none !important; }' +
      '[data-native-tabs="true"] [data-bottom-nav] { display: none !important; }';
    (document.head || document.documentElement).appendChild(style);
  })();
  true;
`;

/**
 * 탭 스택 위에 올리는 웹뷰. 상세 하위 경로 폴백과 검색이 같이 쓴다.
 * 상품 링크는 네이티브 상세로 넘긴다.
 */
export function StackWebView({
  path,
  navigation,
  hideTabBar,
  hideWebNav,
  header,
}: {
  path: string;
  navigation: StackNav;
  hideTabBar: boolean;
  hideWebNav: boolean;
  header?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const webviewRef = useRef<WebView>(null);

  useTokenRemoveEffect();
  useHideTabBar(hideTabBar);
  const tabBarClipPad = useHiddenTabBarClipPadding();
  // 탭바가 보일 때 확보해야 할 하단 여백(탭바 높이 + safe area).
  const reservedBottom = getReservedBottomPx(insets.bottom);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = subscribeOpenDetail(nextPath => {
        navigation.push(tabStackNavigations.DETAIL, {path: nextPath});
      });
      return unsubscribe;
    }, [navigation]),
  );

  const injected = useMemo(
    () =>
      INTERCEPT_DETAIL_LINK_SCRIPT +
      NATIVE_STACK_SCRIPT +
      (hideWebNav ? HIDE_WEB_BOTTOM_NAV : ''),
    [hideWebNav],
  );

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadEnd = useCallback(() => setIsLoading(false), []);
  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);
  const retry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    webviewRef.current?.reload();
  }, []);

  const handleShouldStartLoadWithRequest = useCallback(
    (event: ShouldStartLoadRequest) => {
      if (shouldOpenExternally(event)) {
        openInAppBrowser(event.url);
        return false;
      }
      const pushable = getPushablePath(event.url);
      if (!pushable) return true;
      const current = path.split(/[?#]/)[0];
      const next = pushable.split(/[?#]/)[0];
      if (next === current) return true;
      navigation.push(tabStackNavigations.DETAIL, {path: pushable});
      return false;
    },
    [navigation, path],
  );

  const handleMessage = useCallback(
    (event: Parameters<typeof handleWebViewMessage>[0]) => {
      try {
        const parsed = parsedWebViewMessage(event);
        if (parsed.type === WebViewEventType.PRESS_BACKBUTTON) {
          navigation.goBack();
          return;
        }
      } catch {
        // 형식이 다른 메시지는 기존 브리지로.
      }
      handleWebViewMessage(event);
    },
    [navigation],
  );

  return (
    <View
      style={[
        styles.container,
        // ★탭바를 숨길 땐 잘린 만큼 올리고, 보일 땐 탭바 높이만큼 비운다.
        // 후자를 빼먹어서 웹 콘텐츠가 홈 인디케이터에 붙었다(사용자 지적).
        {paddingBottom: hideTabBar ? tabBarClipPad : reservedBottom},
      ]}>
      <SystemBars style="dark" hidden={false} />
      <View style={[styles.statusBarSpacer, {height: insets.top}]} />
      {header}
      <View style={styles.webviewWrap}>
        <WebView
          ref={webviewRef}
          sharedCookiesEnabled={true}
          pullToRefreshEnabled={true}
          decelerationRate={Platform.OS === 'ios' ? 1.0 : 0.998}
          source={{uri: `${SERVICE_URL}${path}`}}
          applicationNameForUserAgent={USER_AGENT}
          setSupportMultipleWindows={false}
          webviewDebuggingEnabled={__DEV__}
          injectedJavaScriptBeforeContentLoaded={injected}
          injectedJavaScript={injected}
          onLoadEnd={handleLoadEnd}
          onLoadProgress={e => {
            if (e.nativeEvent.progress >= 0.98) {
              setIsLoading(false);
            }
          }}
          onError={handleError}
          onHttpError={handleLoadEnd}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onContentProcessDidTerminate={() => webviewRef.current?.reload()}
          onMessage={handleMessage}
          allowsBackForwardNavigationGestures={false}
        />
        {isLoading && (
          <View style={styles.loadingContainer} pointerEvents="none">
            <ActivityIndicator size="small" color="#667085" />
          </View>
        )}
        {hasError && <WebViewErrorView onRetry={retry} />}
      </View>
    </View>
  );
}

type Props = NativeStackScreenProps<
  ProductFlowParamList,
  typeof tabStackNavigations.DETAIL
>;

/** `/products/123/comment` 등 네이티브가 안 그리는 상세 하위 경로. */
function ProductDetailWebViewScreen({route, navigation}: Props) {
  const {path} = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({headerShown: false});
  }, [navigation]);

  return (
    <StackWebView
      path={path}
      navigation={navigation}
      hideTabBar={isProductPath(path)}
      hideWebNav={!isProductPath(path)}
    />
  );
}

export default ProductDetailWebViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  statusBarSpacer: {
    backgroundColor: '#ffffff',
  },
  webviewWrap: {
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
    backgroundColor: '#ffffff',
  },
});
