import * as WebBrowser from 'expo-web-browser';
import {Alert, Linking, Platform} from 'react-native';
import {
  openInAppBrowser,
  shouldOpenExternally,
} from '../src/shared/lib/navigation/in-app-browser';
import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
  WebBrowserPresentationStyle: {
    PAGE_SHEET: 'pageSheet',
  },
}));

describe('openInAppBrowser', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      value: originalPlatform,
    });
  });

  // fallback URL 보다 앱 스킴이 먼저 — 순서가 반대면 앱이 깔려 있어도 웹으로 간다.
  it('opens the app scheme first for android intent urls', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'android'});

    await openInAppBrowser(
      'intent://send?appkey=abc#Intent;scheme=kakaolink;package=com.kakao.talk;S.browser_fallback_url=https%3A%2F%2Fexample.com;end',
    );

    expect(Linking.openURL).toHaveBeenCalledWith('kakaolink://send?appkey=abc');
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  it('opens intent fallback urls when the app scheme fails', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'android'});
    jest
      .spyOn(Linking, 'openURL')
      .mockRejectedValueOnce(new Error('no handler'))
      .mockResolvedValue(undefined);

    await openInAppBrowser(
      'intent://example.com/path#Intent;scheme=https;S.browser_fallback_url=https%3A%2F%2Fexample.com;end',
    );

    expect(Linking.openURL).toHaveBeenLastCalledWith('https://example.com');
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  it('opens package market fallback when intent package exists', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'android'});
    jest
      .spyOn(Linking, 'openURL')
      .mockRejectedValueOnce(new Error('no handler'))
      .mockResolvedValue(undefined);

    await openInAppBrowser(
      'intent://example.com/path#Intent;scheme=https;package=com.example.app;end',
    );

    expect(Linking.openURL).toHaveBeenLastCalledWith(
      'market://details?id=com.example.app',
    );
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  it('delegates special schemes to Linking', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});

    await openInAppBrowser('mailto:test@example.com');

    expect(Linking.openURL).toHaveBeenCalledWith('mailto:test@example.com');
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  it('opens standard urls in expo web browser', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});

    await openInAppBrowser('https://example.com');

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        dismissButtonStyle: 'close',
        presentationStyle: 'pageSheet',
        toolbarColor: '#ffffff',
      }),
    );
  });

  it('falls back to Linking when expo web browser fails', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});
    jest
      .spyOn(WebBrowser, 'openBrowserAsync')
      .mockRejectedValueOnce(new Error('browser failed'));

    await openInAppBrowser('https://example.com');

    expect(Linking.openURL).toHaveBeenCalledWith('https://example.com');
  });

  // https intent 는 유니버설 링크가 아니라 앱이 깔려 있어도 브라우저 웹페이지가 뜬다.
  // 앱 전용 스킴으로 변환해 열어야 X·스레드 앱이 직접 뜬다.
  it('opens the X app scheme for tweet intents (text+url merged)', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});

    await openInAppBrowser(
      'https://twitter.com/intent/tweet?text=hi%20there&url=https%3A%2F%2Fjirum-alarm.com',
    );

    expect(Linking.openURL).toHaveBeenCalledWith(
      `twitter://post?message=${encodeURIComponent(
        'hi there\nhttps://jirum-alarm.com',
      )}`,
    );
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  it('opens the Threads app scheme for post intents', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});

    await openInAppBrowser('https://www.threads.net/intent/post?text=hi');

    expect(Linking.openURL).toHaveBeenCalledWith('barcelona://create?text=hi');
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  // 앱 미설치면 스킴이 실패한다 — https intent(OS 위임)로 폴백해 공유를 살린다.
  it('falls back to the https intent when the app scheme fails', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});
    jest
      .spyOn(Linking, 'openURL')
      .mockRejectedValueOnce(new Error('not installed'))
      .mockResolvedValue(undefined);

    const url = 'https://x.com/intent/tweet?text=hi';
    await openInAppBrowser(url);

    expect(Linking.openURL).toHaveBeenLastCalledWith(url);
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  // 카카오 SDK 가 발화하는 kakaolink:// — canOpenURL 게이트 없이 바로 OS 로.
  it('delegates custom schemes like kakaolink to the OS', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});

    await openInAppBrowser('kakaolink://send?appkey=abc');

    expect(Linking.openURL).toHaveBeenCalledWith('kakaolink://send?appkey=abc');
    expect(Linking.canOpenURL).not.toHaveBeenCalled();
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  it('keeps product links in the in-app browser (share-only exception)', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});

    await openInAppBrowser('https://smartstore.naver.com/some/product');

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalled();
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('falls back to the in-app browser when share intent linking fails', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});
    jest
      .spyOn(Linking, 'openURL')
      .mockRejectedValueOnce(new Error('no handler')) // 앱 스킴
      .mockRejectedValueOnce(new Error('no handler')); // https intent

    await openInAppBrowser('https://x.com/intent/tweet?text=hi');

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalled();
  });

  it('shows an alert when fallback linking also fails', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});
    jest
      .spyOn(WebBrowser, 'openBrowserAsync')
      .mockRejectedValueOnce(new Error('browser failed'));
    jest
      .spyOn(Linking, 'openURL')
      .mockRejectedValueOnce(new Error('link fail'));

    await openInAppBrowser('https://example.com');

    expect(Alert.alert).toHaveBeenCalledWith('알림', '링크를 열 수 없습니다.');
  });
});

describe('shouldOpenExternally', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {value: originalPlatform});
  });

  const event = (
    url: string,
    navigationType: ShouldStartLoadRequest['navigationType'] = 'other',
  ) => ({url, navigationType} as ShouldStartLoadRequest);

  // 카카오 SDK 의 kakaolink:// 는 JS 발화라 navigationType 이 'click'이 아니고,
  // 공유 파라미터에 jirum-alarm 이 들어 있어도 내부 링크가 아니다 — 둘 다 뚫어야 카톡이 뜬다.
  it('exports custom schemes on ios even without a click', () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});

    expect(
      shouldOpenExternally(
        event('kakaolink://send?url=https%3A%2F%2Fjirum-alarm.com'),
      ),
    ).toBe(true);
  });

  it('keeps non-click https navigations inside the webview on ios', () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});

    expect(shouldOpenExternally(event('https://example.com'))).toBe(false);
    expect(shouldOpenExternally(event('about:blank', 'click'))).toBe(false);
    expect(shouldOpenExternally(event('javascript:void(0)', 'click'))).toBe(
      false,
    );
  });
});
