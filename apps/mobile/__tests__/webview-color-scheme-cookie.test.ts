/**
 * 앱 웹뷰를 앱과 같은 라이트/다크로 — web 은 서버가 COLOR_SCHEME 쿠키로 <html class="dark"> 를 정한다.
 * 이름·값이 web 과 어긋나면 조용히 늘 라이트가 된다(에러 없음) → web 소스와 대조해 묶는다.
 */
import CookieManager from '@react-native-cookies/cookies';

import {SERVICE_URL} from '../src/constants/env';
import {
  COLOR_SCHEME_COOKIE,
  syncWebViewColorScheme,
} from '../src/shared/theme/webview-color-scheme-cookie';

jest.mock('@react-native-cookies/cookies', () => ({
  __esModule: true,
  default: {set: jest.fn(() => Promise.resolve(true))},
}));

const fs = require('fs');
const path = require('path');
declare const __dirname: string;
const read = (p: string): string =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

describe('웹뷰 다크 쿠키', () => {
  const set = CookieManager.set as jest.Mock;
  beforeEach(() => set.mockClear());

  it.each([
    [true, 'dark'],
    [false, 'light'],
  ])('다크=%s → 서비스 도메인에 COLOR_SCHEME=%s', async (dark, value) => {
    await syncWebViewColorScheme(dark);
    expect(set).toHaveBeenCalledWith(SERVICE_URL, {
      name: COLOR_SCHEME_COOKIE,
      value,
      path: '/',
    });
  });

  it('쿠키를 못 써도 앱은 멈추지 않는다', async () => {
    set.mockImplementationOnce(() => Promise.reject(new Error('cookie store')));
    await expect(syncWebViewColorScheme(true)).resolves.toBe(false);
  });

  // 이름·값은 web 서버와 같은 @jirum/domain/color-scheme 계약 — web 파일을 읽어 대조하지 않는다.
  it('쓰는 값을 web 이 다크로 읽는다(같은 계약)', () => {
    const {isDarkCookie} = require('@jirum/domain/color-scheme');
    expect(isDarkCookie('dark')).toBe(true);
    expect(isDarkCookie('light')).toBe(false);
    expect(read('src/shared/theme/webview-color-scheme-cookie.ts')).toContain(
      "from '@jirum/domain/color-scheme'",
    );
  });

  it('앱 루트에서 건다', () => {
    expect(read('App.tsx')).toContain('useWebViewColorSchemeCookie();');
  });
});
