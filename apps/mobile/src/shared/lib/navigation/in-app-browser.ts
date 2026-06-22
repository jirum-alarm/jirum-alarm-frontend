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
 * Opens a URL in the in-app browser
 *
 * Falls back to system browser if in-app browser is unavailable
 *
 * @param url - URL to open
 */
export async function openInAppBrowser(url: string) {
  try {
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
