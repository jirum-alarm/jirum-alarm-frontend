import {getPushablePath} from '../src/shared/lib/navigation/tab-routing';

describe('getPushablePath', () => {
  it('상품 상세는 push 경로를 돌려준다', () => {
    expect(getPushablePath('https://jirum-alarm.com/products/123')).toBe(
      '/products/123',
    );
  });

  it('상세 하위 경로도 같은 스택에 쌓는다', () => {
    expect(
      getPushablePath('https://jirum-alarm.com/products/123/comment'),
    ).toBe('/products/123/comment');
  });

  it('쿼리를 잃지 않는다 — extractPath 는 버리므로 별도 처리한 부분', () => {
    expect(
      getPushablePath('https://jirum-alarm.com/products/123?from=home'),
    ).toBe('/products/123?from=home');
  });

  it('목록·탭 루트는 push 하지 않는다 (기존 웹뷰 유지)', () => {
    expect(getPushablePath('https://jirum-alarm.com/')).toBeNull();
    expect(
      getPushablePath('https://jirum-alarm.com/trending/ranking'),
    ).toBeNull();
    expect(getPushablePath('https://jirum-alarm.com/community')).toBeNull();
  });

  it('/products 목록 자체는 상세가 아니다', () => {
    expect(getPushablePath('https://jirum-alarm.com/products')).toBeNull();
  });

  it('숫자가 아닌 하위는 상세로 보지 않는다', () => {
    expect(getPushablePath('https://jirum-alarm.com/products/new')).toBeNull();
  });
});

/**
 * push 조건의 플랫폼 분기 회귀 가드.
 *
 * react-native-webview 는 Android 에서 navigationType 이 항상 'other' 다
 * (WebViewTypes.d.ts). 그래서 'click' 을 요구하면 Android 는 상세 push 가
 * 영영 안 걸린다. TabWebView 의 조건이 iOS 로 한정돼 있는지 소스로 검사한다.
 * (TabWebView 는 RN 컴포넌트라 여기서 직접 require 할 수 없어 텍스트로 본다.)
 */
describe('상세 push 조건', () => {
  const src: string = require('fs').readFileSync(
    require('path').resolve(process.cwd(), 'src/screens/tabs/TabWebView.tsx'),
    'utf8',
  );

  it("navigationType === 'click' 을 iOS 로 한정한다", () => {
    expect(src).toMatch(
      /Platform\.OS\s*!==\s*'ios'\s*\|\|\s*event\.navigationType\s*===\s*'click'/,
    );
  });

  it('플랫폼 분기 없이 click 만 요구하지 않는다', () => {
    expect(src).not.toMatch(
      /if\s*\([^)]*event\.navigationType\s*===\s*'click'\s*\)/,
    );
  });
});
