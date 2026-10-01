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
  NATIVE_STACK_SCRIPT,
  parsedWebViewMessage,
  WebViewEventType,
} from '@/shared/lib/webview';
import {subscribeOpenDetail} from '@/shared/lib/webview/event';
import {INTERCEPT_DETAIL_LINK_SCRIPT} from '@/shared/lib/webview/intercept-detail-link';
import {openInAppBrowser, shouldOpenExternally} from '@/shared/lib/navigation';
import {getPushablePath} from '@/shared/lib/navigation/tab-routing';
import WebViewErrorView from '@/shared/components/WebViewErrorView';
import {useTokenRemoveEffect} from '@/screens/jirumalarmwebview/hooks/useTokenRemoveEffect';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import type {ProductFlowParamList} from '@/navigations/tab/types';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useChromeColors} from '@/navigations/tab/native-headers';
import {fixed} from '@/shared/theme/palette';

type StackNav = Pick<
  NativeStackNavigationProp<ProductFlowParamList>,
  'push' | 'goBack'
>;

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
  hideWebNav,
  header,
}: {
  path: string;
  navigation: StackNav;
  hideWebNav: boolean;
  header?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const chrome = useChromeColors();
  const webviewRef = useRef<WebView>(null);

  useTokenRemoveEffect();
  const tabBarClipPad = useHiddenTabBarClipPadding();

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
        {backgroundColor: chrome.screenBackground},
        // ★탭바를 숨길 땐 잘린 만큼 올리고, 보일 땐 탭바 높이만큼 비운다.
        // 후자를 빼먹어서 웹 콘텐츠가 홈 인디케이터에 붙었다(사용자 지적).
        {paddingBottom: tabBarClipPad},
      ]}>
      {/* 상태바 칸은 헤더(테마를 따름)와 같은 바탕이라 글자색도 테마를 따른다. */}
      <SystemBars style="auto" hidden={false} />
      <View
        style={{height: insets.top, backgroundColor: chrome.screenBackground}}
      />
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
            <ActivityIndicator size="small" className="text-gray-500" />
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
      // 웹 자체 하단바(BottomNav)도 숨긴다 — 상세엔 찜·구매 CTA 만 남는다.
      hideWebNav
    />
  );
}

export default ProductDetailWebViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    // web 본문은 다크모드가 없어 늘 흰색이다 — 로딩 가림막도 그 색이어야 뜰 때 번쩍이지 않는다.
    backgroundColor: fixed.white,
  },
});
