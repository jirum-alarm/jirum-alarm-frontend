import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  AppState,
  BackHandler,
  Linking,
  Platform,
  ToastAndroid,
  View,
} from 'react-native';
import PressableOpacity from '@/shared/components/PressableOpacity';
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
import type {TabStackParamList} from '@/shared/lib/navigation/param-list';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useColors} from '@/shared/theme/useColors';
import {
  canOpenUniversalLinks,
  openUniversalLink,
} from '@/shared/lib/universal-link';

import {
  LANDING_COVER_MAX_MS,
  LANDING_COVER_SETTLE_MS,
  LANDING_HANDOFF_WINDOW_MS,
  appSchemeName,
  decidePurchaseNavigation,
  httpsUpgradeOf,
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
  // http→https 로 올려 다시 띄운 주소(한 번만 — 아래 handleShouldStart).
  const upgradedUrls = useRef(new Set<string>());

  const [progress, setProgress] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [hasError, setHasError] = useState(false);
  const c = useColors();

  // 여는 동안의 가림막(LANDING_COVER_* 주석). handedOff = 앱으로 넘겼다(가린 채 「앱에서 열었어요」).
  const [cover, setCover] = useState<'loading' | 'handedOff' | null>('loading');
  const lastTopNavAt = useRef(Date.now());
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealIfStillLoading = useCallback(() => {
    setCover(prev => (prev === 'loading' ? null : prev));
  }, []);
  useEffect(() => {
    const max = setTimeout(revealIfStillLoading, LANDING_COVER_MAX_MS);
    return () => {
      clearTimeout(max);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, [revealIfStillLoading]);
  const handleLoadEnd = useCallback(() => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      if (Date.now() - lastTopNavAt.current >= LANDING_COVER_SETTLE_MS) {
        revealIfStillLoading();
      }
    }, LANDING_COVER_SETTLE_MS);
  }, [revealIfStillLoading]);

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

  const universalFailed = useRef(false);

  const handOff = useCallback(
    async (appUrl: string, via: 'scheme' | 'universal' = 'scheme') => {
      const result =
        via === 'universal'
          ? {
              opened: await openUniversalLink(appUrl),
              // 앱이 없으면 같은 주소를 웹으로 — 지금까지(웹뷰가 그대로 로드)와 같은 결과.
              fallbackUrl: appUrl,
            }
          : await openExternalApp(appUrl);
      if (via === 'universal' && !result.opened) universalFailed.current = true;
      if (result.opened) {
        // 여는 동안(가림막이 아직 있을 때) 넘어갔으면 중간 웹 화면을 끝까지 보이지 않는다.
        setCover(prev => (prev === 'loading' ? 'handedOff' : prev));
        if (handedOffAt.current == null) {
          handedOffAt.current = Date.now();
          // iOS 는 넘어간 앱 왼쪽 위에 OS 가 「◀ 지름알림」을 붙여 준다. 안드로이드엔 그게 없어
          // 시스템 토스트(다른 앱 위에도 잠깐 보인다)로 돌아오는 길을 알려 준다.
          if (Platform.OS === 'android') {
            ToastAndroid.show(
              '뒤로가기를 누르면 지름알림으로 돌아와요',
              ToastAndroid.LONG,
            );
          }
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
      const httpsUrl = httpsUpgradeOf(request);
      // https 가 다시 http 로 돌려보내는 사이트면 한 번만 — 무한 왕복 대신 에러 화면(「브라우저」로 열기)으로.
      if (httpsUrl && !upgradedUrls.current.has(httpsUrl)) {
        upgradedUrls.current.add(httpsUrl);
        webviewRef.current?.injectJavaScript(
          `window.location.replace(${JSON.stringify(httpsUrl)}); true;`,
        );
        return false;
      }
      const decision = decidePurchaseNavigation(request, {
        handedOff: handedOffAt.current != null,
        universalLinks: canOpenUniversalLinks && !universalFailed.current,
      });
      switch (decision.kind) {
        case 'load':
          if (request.isTopFrame !== false) {
            lastTopNavAt.current = Date.now();
            if (settleTimer.current) clearTimeout(settleTimer.current);
          }
          return true;
        case 'block':
          return false;
        case 'store':
          Linking.openURL(decision.url).catch(() => {});
          return false;
        case 'app':
          void handOff(decision.url);
          return false;
        case 'universal':
          void handOff(decision.url, 'universal');
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
          <PressableOpacity
            onPress={close}
            hitSlop={8}
            className="h-11 flex-row items-center gap-x-0.5 pr-1"
            accessibilityRole="button"
            accessibilityLabel="지름알림으로 돌아가기">
            <Close />
            {/* X 만으론 «쇼핑몰을 닫고 지름알림으로 간다»가 안 읽혀서 이름을 붙인다. */}
            <Text className="text-sm font-semibold text-gray-900">
              지름알림
            </Text>
          </PressableOpacity>
          {canGoBack ? (
            <PressableOpacity
              onPress={() => webviewRef.current?.goBack()}
              hitSlop={8}
              className="size-11 items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="이전 페이지">
              <CaretLeft width={24} height={24} />
            </PressableOpacity>
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
          <PressableOpacity
            onPress={() => Linking.openURL(currentUrl).catch(() => {})}
            hitSlop={8}
            className="h-11 items-center justify-center px-2"
            accessibilityRole="button"
            accessibilityLabel="브라우저로 열기">
            <Text className="text-sm text-gray-600">브라우저</Text>
          </PressableOpacity>
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
          source={{uri: url.replace(/^http:/i, 'https:')}}
          originWhitelist={['*']}
          onShouldStartLoadWithRequest={handleShouldStart}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadProgress={({nativeEvent}) => setProgress(nativeEvent.progress)}
          onLoadStart={() => setHasError(false)}
          onLoadEnd={handleLoadEnd}
          onError={() => {
            setHasError(true);
            setCover(null);
          }}
          allowsBackForwardNavigationGestures
          // sharedCookiesEnabled 를 켜지 않는다 — iOS 에선 쇼핑몰이 쿠키를 구울 때마다 저장소 쿠키 전부를
          // 메인 스레드에서 다시 써 화면이 몇 초씩 멈췄다(App Hanging). 외부 쇼핑몰이라 앱 쿠키가 필요 없고,
          // 쇼핑몰 로그인은 웹뷰 기본 저장소에 그대로 남는다.
          // 결제창(PG)이 새 창으로 뜨는 쇼핑몰이 있다 — 같은 웹뷰에서 연다.
          setSupportMultipleWindows={false}
          javaScriptCanOpenWindowsAutomatically
          allowsInlineMediaPlayback
          // 숫자로 — 'normal' 을 숫자로 바꾸는 건 iOS 래퍼뿐이라 Android 네이티브가 문자열을 Double 로
          // 캐스팅하다 죽는다(Sentry JIRUM-ALARM-APP-6 ClassCastException). 0.998 = iOS 'normal'.
          decelerationRate={0.998}
        />
        {cover ? (
          <View
            className="absolute inset-0 items-center justify-center gap-y-3 bg-white px-8"
            accessibilityLiveRegion="polite">
            {cover === 'loading' ? (
              <>
                <ActivityIndicator color={c.gray[900]} />
                <Text className="text-sm text-gray-600">
                  {title ? `${title} 상품으로 이동 중…` : '상품으로 이동 중…'}
                </Text>
              </>
            ) : (
              <>
                <Text className="text-base font-semibold text-gray-900">
                  {title
                    ? `${title} 앱에서 열었어요`
                    : '쇼핑몰 앱에서 열었어요'}
                </Text>
                {/* 앱이 안 떴거나 여기서 보고 싶은 사람 — 가림막만 걷는다. */}
                <PressableOpacity
                  onPress={() => setCover(null)}
                  hitSlop={8}
                  className="h-11 justify-center px-3"
                  accessibilityRole="button">
                  <Text className="text-sm text-gray-600 underline">
                    여기서 계속 보기
                  </Text>
                </PressableOpacity>
              </>
            )}
          </View>
        ) : null}
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
