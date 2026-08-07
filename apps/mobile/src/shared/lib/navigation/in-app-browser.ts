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
  if (event.url === 'about:blank' || event.url.startsWith('javascript:')) {
    return false;
  }
  // kakaolink:// 등 커스텀 스킴은 SDK 가 발화해 navigationType 이 'click'이 아니고,
  // 공유 URL 파라미터에 jirum-alarm 이 들어 있어 내부 링크로 오판되기도 한다.
  // WebView 는 어차피 http(s)만 로드하므로 아래 게이트들보다 먼저 내보낸다.
  if (!isHttpUrl(event.url)) {
    return true;
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

/** WebView·인앱 브라우저가 열 수 있는 것은 http(s)뿐 — 나머지 스킴은 OS 몫이다. */
const isHttpUrl = (url: string) =>
  url.startsWith('http://') || url.startsWith('https://');

/** URL 쿼리 파라미터 추출(디코딩 포함). RN 내장 URL 은 searchParams 미구현이라 정규식. */
const getQueryParam = (url: string, key: string): string => {
  const match = url.match(new RegExp(`[?&]${key}=([^&#]*)`));
  return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : '';
};

/**
 * SNS 공유 intent URL 인지 판정.
 *
 * 인앱 브라우저(SFSafariViewController·Chrome Custom Tabs)는 설치된 앱으로 넘겨주지
 * 않아서, 공유하려고 X·스레드를 눌러도 웹뷰 안에 웹페이지가 뜬다.
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
 * SNS 공유 intent(https)를 앱 전용 스킴으로 변환.
 *
 * X·스레드 모두 /intent/ 경로를 유니버설/앱 링크로 등록하지 않아, Linking.openURL 로
 * OS 에 위임해도 앱이 아니라 브라우저 웹페이지가 뜬다(앱이 깔려 있어도). 앱을 확실히
 * 띄우는 건 전용 스킴뿐 — 미설치로 실패하면 호출부가 https intent 로 폴백한다.
 */
const toShareAppScheme = (url: string): string | null => {
  if (/^https:\/\/(twitter|x)\.com\/intent\//.test(url)) {
    const text = getQueryParam(url, 'text');
    // x intent 는 text 와 url 이 분리돼 온다(share.ts) — 스킴은 message 하나뿐이라 합친다.
    const link = getQueryParam(url, 'url');
    const message = link ? `${text}\n${link}` : text;
    return `twitter://post?message=${encodeURIComponent(message)}`;
  }
  if (/^https:\/\/(www\.)?threads\.net\/intent\//.test(url)) {
    // barcelona = 스레드의 내부 코드네임 스킴(iOS·Android 공통).
    return `barcelona://create?text=${encodeURIComponent(
      getQueryParam(url, 'text'),
    )}`;
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
    // 공유 intent — 네이티브 앱 스킴 우선, 미설치면 https intent(OS 위임)로,
    // 그마저 실패하면 아래 인앱 브라우저로 흘려보낸다(공유를 조용히 죽이지 않게).
    if (isShareIntent(url)) {
      const appScheme = toShareAppScheme(url);
      if (appScheme) {
        try {
          await Linking.openURL(appScheme);
          return;
        } catch {
          // 앱 미설치 — https intent 로 폴백
        }
      }
      try {
        await Linking.openURL(url);
        return;
      } catch {
        // fall through
      }
    }

    // Android intent:// 스킴 — 앱 스킴을 먼저 열어야 한다.
    // fallback URL 을 먼저 열면 앱이 깔려 있어도 웹/스토어로 간다(카톡 공유가 그랬음).
    if (Platform.OS === 'android' && url.startsWith('intent:')) {
      const schemeMatch = url.match(/scheme=([^;]+)/);
      const hostMatch = url.match(/intent:\/\/([^#]+)/);
      if (schemeMatch && hostMatch) {
        try {
          await Linking.openURL(`${schemeMatch[1]}://${hostMatch[1]}`);
          return;
        } catch {
          // 앱 미설치 — fallback 으로
        }
      }
      const fallbackMatch = url.match(/S\.browser_fallback_url=([^;]+)/);
      if (fallbackMatch) {
        try {
          await Linking.openURL(decodeURIComponent(fallbackMatch[1]));
          return;
        } catch {
          // 스토어로
        }
      }
      const packageMatch = url.match(/package=([^;]+)/);
      if (packageMatch) {
        await Linking.openURL(`market://details?id=${packageMatch[1]}`);
      }
      return;
    }

    // http(s) 가 아닌 스킴(kakaolink·kakaotalk·market·tel·mailto 등)은 전부 시스템에 위임.
    // canOpenURL 은 iOS 에서 LSApplicationQueriesSchemes 미등록 스킴에 false 를 주므로
    // 쓰지 않는다 — openURL 은 등록 없이도 동작하고, 실패는 바깥 catch 가 받는다.
    if (!isHttpUrl(url)) {
      await Linking.openURL(url);
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
