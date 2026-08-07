import {Platform} from 'react-native';
import {shouldOpenExternally} from '../src/shared/lib/navigation/in-app-browser';
import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
  WebBrowserPresentationStyle: {PAGE_SHEET: 'pageSheet'},
}));

// 웹 로그인 페이지는 앱 판별 게이트가 없어 WebView 안에서도 렌더된다.
// Kakao.Auth.authorize() 가 여는 https OAuth 페이지가 WebView 안에 남아야
// 콜백(redirect_uri=jirum-alarm.com/login/callback/kakao)까지 한 흐름으로 이어진다.
// 인앱 브라우저로 튕기면 쿠키/세션이 갈려 로그인이 완료되지 않는다.
//
// ⚠️ 아래 authorize 케이스가 통과하는 이유는 **호스트가 우리 것이어서가 아니라**
// isInternal 이 단순 부분문자열 검사(`url.includes('jirum-alarm')`)이고 redirect_uri
// 쿼리에 우리 도메인이 들어 있어서다. 즉 우연히 통과한다.
// redirect_uri 가 없는 후속 단계(accounts.kakao.com/login, 약관 동의)는 이 검사를
// 통과하지 못해 인앱 브라우저로 튕긴다 — Android 는 항상, iOS 는 사용자가 직접 클릭한
// 경우. 이건 이 커밋 이전부터 있던 동작이라 여기서는 현행을 기록만 한다.
// 고치려면 부분문자열 대신 호스트를 파싱해 판정해야 한다.
describe('kakao login routing through the webview', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {value: originalPlatform});
  });

  const event = (
    url: string,
    navigationType: ShouldStartLoadRequest['navigationType'] = 'click',
  ) => ({url, navigationType} as ShouldStartLoadRequest);

  it.each(['ios', 'android'])(
    'keeps the kakao oauth page inside the webview on %s',
    os => {
      Object.defineProperty(Platform, 'OS', {value: os});

      expect(
        shouldOpenExternally(
          event(
            'https://kauth.kakao.com/oauth/authorize?client_id=abc&redirect_uri=https%3A%2F%2Fjirum-alarm.com%2Flogin%2Fcallback%2Fkakao',
          ),
        ),
      ).toBe(false);
    },
  );

  it('keeps the naver oauth page inside the webview', () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});

    expect(
      shouldOpenExternally(
        event(
          'https://nid.naver.com/oauth2.0/authorize?client_id=abc&redirect_uri=https%3A%2F%2Fjirum-alarm.com%2Flogin%2Fcallback%2Fnaver',
        ),
      ),
    ).toBe(false);
  });

  it('keeps the login callback inside the webview', () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});

    expect(
      shouldOpenExternally(
        event('https://jirum-alarm.com/login/callback/kakao?code=xyz'),
      ),
    ).toBe(false);
  });

  // 카톡 앱으로 넘어가 인증하는 스킴. 앱이 떠야 하므로 이건 반대로 내보내야 한다.
  it('exports the kakao auth app scheme', () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});

    expect(
      shouldOpenExternally(event('kakaokompassauth://authorize?client_id=abc')),
    ).toBe(true);
  });

  // 🔴 현행 결함을 고정한다(기대값이 아니라 실제 동작). redirect_uri 가 빠진 OAuth
  // 후속 단계는 isInternal 부분문자열 검사를 통과하지 못해 인앱 브라우저로 튕긴다.
  // 로그인 중간에 창이 갈리면 세션이 끊긴다. 호스트 파싱으로 고칠 때 이 테스트가
  // false 로 뒤집혀야 한다.
  it.each([
    'https://accounts.kakao.com/login/?continue=%2Foauth%2Fauthorize',
    'https://accounts.kakao.com/weblogin/terms_of_service',
  ])('KNOWN BUG: bounces mid-oauth page out of the webview: %s', url => {
    Object.defineProperty(Platform, 'OS', {value: 'android'});

    expect(shouldOpenExternally(event(url))).toBe(true);
  });
});
