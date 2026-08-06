import React, {useCallback, useRef, useState} from 'react';
import {ActivityIndicator, Platform, StyleSheet, View} from 'react-native';
import WebView from 'react-native-webview';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SystemBars} from 'react-native-edge-to-edge';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

import {SERVICE_URL, USER_AGENT} from '@/constants/env';
import {handleWebViewMessage} from '@/shared/lib/webview';
import {openInAppBrowser, shouldOpenExternally} from '@/shared/lib/navigation';
import WebViewErrorView from '@/shared/components/WebViewErrorView';
import {useTokenRemoveEffect} from '@/screens/jirumalarmwebview/hooks/useTokenRemoveEffect';
import type {TabStackParamList} from '@/navigations/tab/types';
import {tabStackNavigations} from '@/shared/constant/navigations';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.DETAIL
>;

/**
 * 탭 안에서 push 되는 상세 WebView.
 *
 * 탭 루트와 달리 자기 WebView 를 새로 띄운다. 네이티브 스택이 전환을 맡으므로
 * 이전 화면이 뒤에 남아 있어 흰 화면 구간이 없다.
 */
function ProductDetailWebViewScreen({route}: Props) {
  const {path} = route.params;
  const insets = useSafeAreaInsets();
  const webviewRef = useRef<WebView>(null);

  useTokenRemoveEffect();

  // 첫 페인트까지만 덮는다. 스택 전환 애니메이션이 이 위를 지나가므로
  // 지연 없이 바로 띄워야 빈 화면이 스쳐 보이지 않는다.
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
      return true;
    },
    [],
  );

  return (
    <View style={styles.container}>
      <SystemBars style="dark" hidden={false} />
      <View style={[styles.statusBarSpacer, {height: insets.top}]} />
      <WebView
        ref={webviewRef}
        sharedCookiesEnabled={true}
        pullToRefreshEnabled={true}
        decelerationRate={Platform.OS === 'ios' ? 1.0 : 0.998}
        source={{uri: `${SERVICE_URL}${path}`}}
        applicationNameForUserAgent={USER_AGENT}
        setSupportMultipleWindows={false}
        webviewDebuggingEnabled={__DEV__}
        // 웹 CTA 는 네이티브 accessory 가 대신 그린다. 첫 페인트 전에 숨겨
        // 깜빡임을 없애고, SPA 라우팅 후에도 다시 적용되도록 둘 다 건다.
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
        onMessage={handleWebViewMessage}
        allowsBackForwardNavigationGestures={false}
      />
      {isLoading && (
        <View style={styles.loadingContainer} pointerEvents="none">
          <ActivityIndicator size="small" color="#667085" />
        </View>
      )}
      {hasError && <WebViewErrorView onRetry={retry} />}
      {/*
        탭바가 숨은 자리를 이 CTA 가 대신한다(MainTabNavigator 의 tabBarHidden).
        네이티브 유리라 iOS 26 에서는 뒤 콘텐츠가 비친다.
      */}
    </View>
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
