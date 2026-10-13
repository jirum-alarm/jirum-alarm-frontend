import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppState, BackHandler, Linking, Pressable, View} from 'react-native';
import WebView from 'react-native-webview';
import type {
  ShouldStartLoadRequest,
  WebViewNavigation,
} from 'react-native-webview/lib/WebViewTypes';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Text} from '@/shared/components/ui/Text/AppText';
import Close from '@/shared/components/icons/Close';
import CaretLeft from '@/shared/components/icons/caret_left';
import WebViewErrorView from '@/shared/components/WebViewErrorView';
import {HEADER_HEIGHT} from '@/features/mypage/ui/StackHeader';
import {Analytics} from '@/shared/lib/analytics/ga4';
import type {TabStackParamList} from '@/navigations/tab/types';
import {tabStackNavigations} from '@/shared/constant/navigations';

import {
  LANDING_HANDOFF_WINDOW_MS,
  appSchemeName,
  decidePurchaseNavigation,
  openExternalApp,
} from './lib/purchase-navigation';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.PURCHASE_BROWSER
>;

const hostOf = (url: string) => url.match(/^https?:\/\/([^/?#]+)/i)?.[1] ?? '';

/**
 * 구매 링크 전용 웹뷰(실험 app_purchase_webview_v1 의 처치 군).
 *
 * 시스템 인앱 브라우저와 달리 페이지가 부르는 앱 링크(coupang://·supertoss://·intent://)를 받아
 * 우리가 직접 그 앱을 연다 — 확인창 없이 쇼핑몰 앱 상품 페이지로 바로 간다. 앱이 없으면
 * 쇼핑몰이 준비한 웹 폴백이 이 화면에 그대로 뜬다(판정은 lib/purchase-navigation).
 * 열자마자 앱으로 넘어갔으면 돌아왔을 때 이 화면은 할 일이 없으니 닫고 상세로 돌려보낸다.
 */
export default function PurchaseBrowserScreen({route, navigation}: Props) {
  const {url, title, productId} = route.params;
  const insets = useSafeAreaInsets();
  const webviewRef = useRef<WebView>(null);
  const openedAt = useRef(Date.now());
  /** 앱으로 넘긴 시각 — 있으면 뒤늦은 스토어 폴백을 막고, 복귀 시 닫을지 판단한다. */
  const handedOffAt = useRef<number | null>(null);
  const leftApp = useRef(false);

  const [progress, setProgress] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [hasError, setHasError] = useState(false);

  const close = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);

  // 앱으로 넘어갔다가 돌아오면 닫는다(제휴 링크의 자동 이동으로 넘어간 경우만 — 결제 앱 왕복은 남긴다).
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'background' && handedOffAt.current != null) {
        leftApp.current = true;
        return;
      }
      if (state !== 'active' || !leftApp.current) return;
      leftApp.current = false;
      const at = handedOffAt.current;
      if (at != null && at - openedAt.current < LANDING_HANDOFF_WINDOW_MS) {
        close();
      }
    });
    return () => sub.remove();
  }, [close]);

  // 안드로이드 뒤로가기 = 페이지 뒤로, 더 갈 데가 없으면 화면 닫기(스택 기본).
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (!canGoBack) return false;
        webviewRef.current?.goBack();
        return true;
      });
      return () => sub.remove();
    }, [canGoBack]),
  );

  const handOff = useCallback(
    async (appUrl: string) => {
      const result = await openExternalApp(appUrl);
      if (result.opened) {
        if (handedOffAt.current == null) {
          handedOffAt.current = Date.now();
          Analytics.track('purchase_app_handoff', {
            product_id: String(productId),
            app_scheme: appSchemeName(appUrl),
            elapsed_ms: handedOffAt.current - openedAt.current,
          });
        }
        return;
      }
      // 앱 미설치 + intent 의 웹 폴백 주소 — 페이지 타이머 폴백이 없을 수도 있어 직접 띄운다.
      if (result.fallbackUrl) {
        webviewRef.current?.injectJavaScript(
          `window.location.href = ${JSON.stringify(result.fallbackUrl)}; true;`,
        );
      }
    },
    [productId],
  );

  const handleShouldStart = useCallback(
    (request: ShouldStartLoadRequest) => {
      const decision = decidePurchaseNavigation(request, {
        handedOff: handedOffAt.current != null,
      });
      switch (decision.kind) {
        case 'load':
          return true;
        case 'block':
          return false;
        case 'store':
          Linking.openURL(decision.url).catch(() => {});
          return false;
        case 'app':
          void handOff(decision.url);
          return false;
      }
    },
    [handOff],
  );

  const handleNavigationStateChange = useCallback((nav: WebViewNavigation) => {
    setCanGoBack(nav.canGoBack);
    if (/^https?:/i.test(nav.url)) setCurrentUrl(nav.url);
  }, []);

  const host = hostOf(currentUrl);

  return (
    <View className="flex-1 bg-white">
      <View
        className="border-b border-gray-100 bg-white px-3"
        style={{paddingTop: insets.top}}>
        <View
          className="flex-row items-center gap-x-1"
          style={{height: HEADER_HEIGHT}}>
          <Pressable
            onPress={close}
            hitSlop={8}
            className="size-11 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="닫기"
            style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
            <Close />
          </Pressable>
          {canGoBack ? (
            <Pressable
              onPress={() => webviewRef.current?.goBack()}
              hitSlop={8}
              className="size-11 items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="이전 페이지"
              style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
              <CaretLeft width={24} height={24} />
            </Pressable>
          ) : null}
          <View className="flex-1 px-1">
            <Text
              className="text-base font-semibold text-gray-900"
              numberOfLines={1}>
              {title || host || '구매하기'}
            </Text>
            {title && host ? (
              <Text className="text-xs text-gray-500" numberOfLines={1}>
                {host}
              </Text>
            ) : null}
          </View>
          {/* 쇼핑몰 로그인이 남아 있는 기본 브라우저에서 이어 사고 싶은 사람을 위해. */}
          <Pressable
            onPress={() => Linking.openURL(currentUrl).catch(() => {})}
            hitSlop={8}
            className="h-11 items-center justify-center px-2"
            accessibilityRole="button"
            accessibilityLabel="브라우저로 열기"
            style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
            <Text className="text-sm text-gray-600">브라우저</Text>
          </Pressable>
        </View>
        {progress > 0 && progress < 1 ? (
          <View className="absolute bottom-0 left-0 right-0 h-0.5">
            <View
              className="h-0.5 bg-gray-900"
              style={{width: `${Math.round(progress * 100)}%`}}
            />
          </View>
        ) : null}
      </View>
      <View className="flex-1" style={{paddingBottom: insets.bottom}}>
        <WebView
          ref={webviewRef}
          source={{uri: url}}
          originWhitelist={['*']}
          onShouldStartLoadWithRequest={handleShouldStart}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadProgress={({nativeEvent}) => setProgress(nativeEvent.progress)}
          onLoadStart={() => setHasError(false)}
          onError={() => setHasError(true)}
          allowsBackForwardNavigationGestures
          sharedCookiesEnabled
          // 결제창(PG)이 새 창으로 뜨는 쇼핑몰이 있다 — 같은 웹뷰에서 연다.
          setSupportMultipleWindows={false}
          javaScriptCanOpenWindowsAutomatically
          allowsInlineMediaPlayback
          decelerationRate="normal"
        />
        {hasError ? (
          <WebViewErrorView
            onRetry={() => {
              setHasError(false);
              webviewRef.current?.reload();
            }}
          />
        ) : null}
      </View>
    </View>
  );
}
