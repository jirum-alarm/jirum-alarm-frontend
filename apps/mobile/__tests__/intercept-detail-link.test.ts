export {};

/**
 * 주입 스크립트가 href 를 판정하는 규칙.
 *
 * 너무 좁으면 카드를 눌러도 아무 일이 안 일어나고(상세 진입 불가),
 * 너무 넓으면 상세가 아닌 링크까지 삼켜 웹 기능이 죽는다. 둘 다 조용한 사고다.
 */
const PATTERN = /^(?:https?:\/\/[^/]+)?(\/products\/\d+(?:[/?#][^\s]*)?)$/;

const match = (href: string) => href.match(PATTERN)?.[1] ?? null;

describe('상세 링크 가로채기 판정', () => {
  it('상대경로 상세를 잡는다', () => {
    expect(match('/products/123')).toBe('/products/123');
  });

  it('절대경로 상세를 잡고 경로만 넘긴다', () => {
    expect(match('https://jirum-alarm.com/products/123')).toBe('/products/123');
  });

  it('쿼리·해시를 살린다', () => {
    expect(match('/products/123?from=home')).toBe('/products/123?from=home');
    expect(match('/products/123#comment')).toBe('/products/123#comment');
  });

  // 댓글 페이지는 별도 화면이라 같이 잡아 넘긴다(화면이 폴백 처리).
  it('하위 경로도 잡는다', () => {
    expect(match('/products/123/comment')).toBe('/products/123/comment');
  });

  it('상세가 아닌 링크는 건드리지 않는다', () => {
    expect(match('/search?q=x')).toBeNull();
    expect(match('/community')).toBeNull();
    expect(match('/')).toBeNull();
    expect(match('/products/abc')).toBeNull();
  });

  // 외부 쇼핑몰 링크를 삼키면 구매가 막힌다.
  it('외부 도메인의 유사 경로는 잡되 경로만 본다', () => {
    // 같은 형태라도 우리 앱은 SERVICE_URL 안에서만 이 스크립트를 돌린다.
    expect(match('https://example.com/products/123')).toBe('/products/123');
    expect(match('https://coupang.com/vp/products/999?x=1')).toBeNull();
  });

  // ★ 이 스크립트는 TS 템플릿 → WebView eval 로 두 번 해석된다. 정규식 리터럴을
  // 쓰면 이스케이프가 깨져 "Invalid regular expression flags" 로 스크립트 전체가
  // 죽는다 — 가로채기가 통째로 동작하지 않았던 실제 원인이다.
  it('주입 스크립트가 문법적으로 유효하다', () => {
    const src: string = require('fs').readFileSync(
      'src/shared/lib/webview/intercept-detail-link.ts',
      'utf8',
    );
    const body = src.match(/[=] `([\s\S]*?)`;/)![1];
    // eval 계열(new Function)은 lint 가 막으므로 babel 파서로 문법만 검사한다.
    const {parse} = require('@babel/core');
    expect(() => parse(body, {filename: 'injected.js'})).not.toThrow();
  });

  it('경로 판정에 정규식 리터럴을 쓰지 않는다', () => {
    const src: string = require('fs').readFileSync(
      'src/shared/lib/webview/intercept-detail-link.ts',
      'utf8',
    );
    const body = src.match(/[=] `([\s\S]*?)`;/)![1];
    expect(body).not.toMatch(/\.match\(\//);
  });

  it('스크립트가 캡처 단계로 등록돼 있다', () => {
    const src: string = require('fs').readFileSync(
      'src/shared/lib/webview/intercept-detail-link.ts',
      'utf8',
    );
    // 3번째 인자 true 가 빠지면 React/Next 라우터가 먼저 잡아 깜빡임이 돌아온다.
    expect(src).toContain('}, true);');
    expect(src).toContain('e.preventDefault();');
  });
});
