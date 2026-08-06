import * as WebBrowser from 'expo-web-browser';
import {Alert, Linking, Platform} from 'react-native';
import {SERVICE_URL} from '@/constants/env';
import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

/**
 * WebView 요청을 인앱 브라우저로 내보내야 하는지 판정.
 *
 * iOS는 onShouldStartLoadWithRequest가 사용자 클릭뿐 아니라 광고 스크립트의
 * 자동 네비게이션(AdSense 경유 cdn.mediago.io·doubleclick 등)에도 실행된다.
 * 그 자동 로드는 navigationType이 'click'이 아니므로, iOS에서는 사용자가 실제로
 * 누른 외부 링크('click')만 내보내고 나머지는 WebView가 그대로 처리하게 둔다.
 * (Android는 navigationType이 항상 'other'이고 핸들러가 클릭 시에만 호출되므로 제외.)
 */
export const shouldOpenExternally = (
  event: ShouldStartLoadRequest,
): boolean => {
  if (event.url === 'about:blank') {
    return false;
  }
  if (Platform.OS === 'ios' && event.navigationType !== 'click') {
    return false;
  }
  const isInternal =
    event.url.includes('jirum-alarm') || event.url.startsWith(SERVICE_URL);
  if (!isInternal) {
    return true;
  }
  return event.url.startsWith('https://about-us.jirum-alarm.com');
};

/** 앱 스토어 / 딥링크 등 특수 스킴 URL인지 확인 */
const isSpecialScheme = (url: string) => {
  return (
    url.startsWith('market:') ||
    url.startsWith('itms-apps:') ||
    url.startsWith('tel:') ||
    url.startsWith('mailto:')
  );
};

/**
 * Android intent:// 스킴에서 fallback URL 추출
 * intent://example.com/path#Intent;scheme=https;package=com.app;S.browser_fallback_url=https://example.com;end
 */
const extractIntentFallbackUrl = (url: string): string | null => {
  const fallbackMatch = url.match(/S\.browser_fallback_url=([^;]+)/);
  if (fallbackMatch) {
    return decodeURIComponent(fallbackMatch[1]);
  }
  const schemeMatch = url.match(/scheme=([^;]+)/);
  const hostMatch = url.match(/intent:\/\/([^#]+)/);
  if (schemeMatch && hostMatch) {
    return `${schemeMatch[1]}://${hostMatch[1]}`;
  }
  return null;
};

/**
 * SNS 공유 intent URL 인지 판정.
 *
 * 인앱 브라우저(SFSafariViewController·Chrome Custom Tabs)는 설치된 앱으로 넘겨주지
 * 않아서, 공유하려고 X·스레드를 눌러도 웹뷰 안에 웹페이지가 뜬다. 이 URL 들은
 * Linking.openURL 로 OS 에 위임해야 "앱 있으면 앱 / 없으면 기본 브라우저"가 된다.
 * (앱 설치 여부는 웹에서 알 수 없고, 알아낼 필요도 없다 — OS 가 판단한다.)
 *
 * 상품 구매 링크는 반대로 인앱 브라우저가 맞다(이탈 방지). 그래서 공유 intent 만 예외.
 */
const isShareIntent = (url: string) => {
  return (
    url.startsWith('https://twitter.com/intent/') ||
    url.startsWith('https://x.com/intent/') ||
    url.startsWith('https://www.threads.net/intent/') ||
    url.startsWith('https://threads.net/intent/')
  );
};

/**
 * Opens a URL in the in-app browser
 *
 * Falls back to system browser if in-app browser is unavailable
 *
 * @param url - URL to open
 */
export async function openInAppBrowser(url: string) {
  try {
    // 공유 intent 는 OS 에 위임 — 인앱 브라우저는 앱으로 넘기지 못한다.
    // 실패하면 아래 인앱 브라우저로 흘려보낸다(공유를 조용히 죽이지 않게).
    if (isShareIntent(url)) {
      try {
        await Linking.openURL(url);
        return;
      } catch {
        // fall through
      }
    }

    // Android intent:// 스킴 처리
    if (Platform.OS === 'android' && url.startsWith('intent:')) {
      const fallbackUrl = extractIntentFallbackUrl(url);
      if (fallbackUrl) {
        const canOpen = await Linking.canOpenURL(fallbackUrl);
        if (canOpen) {
          await Linking.openURL(fallbackUrl);
          return;
        }
      }
      const packageMatch = url.match(/package=([^;]+)/);
      if (packageMatch) {
        await Linking.openURL(`market://details?id=${packageMatch[1]}`);
      }
      return;
    }

    // 특수 스킴은 시스템에 위임
    if (isSpecialScheme(url)) {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
      return;
    }

    await WebBrowser.openBrowserAsync(url, {
      ...inAppAndroidConfig,
      ...inAppIosConfig,
    });
  } catch {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('알림', '링크를 열 수 없습니다.');
    }
  }
}

const inAppIosConfig = {
  dismissButtonStyle: 'close' as const,
  controlsColor: '#101828',
  readerMode: false,
  presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
  enableBarCollapsing: true,
};

const inAppAndroidConfig = {
  showTitle: true,
  toolbarColor: '#ffffff',
  secondaryToolbarColor: '#101828',
  enableUrlBarHiding: true,
  enableDefaultShareMenuItem: true,
  showInRecents: true,
};
