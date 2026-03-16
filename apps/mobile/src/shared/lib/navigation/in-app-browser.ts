import * as WebBrowser from 'expo-web-browser';
import {Alert, Linking, Platform} from 'react-native';

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
