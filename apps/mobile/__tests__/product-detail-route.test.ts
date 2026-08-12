/**
 * 상세 화면의 네이티브/웹뷰 분기. 여기가 틀리면 라우팅 구멍이 생긴다 —
 * 댓글 페이지가 빈 네이티브 화면으로 뜨거나, 상세가 웹뷰로 새는 식.
 *
 * 화면 컴포넌트를 렌더하면 RN 의존이 줄줄이 딸려오므로 순수 파서만 검사한다.
 */
function parseProductId(path: string): number | null {
  const pathname = path.split(/[?#]/)[0];
  const matched = pathname.match(/^\/products\/(\d+)\/?$/);
  return matched ? Number(matched[1]) : null;
}

describe('parseProductId — 네이티브가 맡을 경로 판정', () => {
  it('상세 본체는 네이티브', () => {
    expect(parseProductId('/products/123')).toBe(123);
    expect(parseProductId('/products/123/')).toBe(123);
  });

  it('쿼리·해시가 붙어도 네이티브', () => {
    expect(parseProductId('/products/123?from=home')).toBe(123);
    expect(parseProductId('/products/123#comment')).toBe(123);
  });

  // TabWebView 의 getPushablePath 는 /products/123/comment 도 push 한다.
  // 그 경로까지 네이티브가 삼키면 댓글 페이지가 사라진다.
  it('하위 경로는 웹뷰로 폴백', () => {
    expect(parseProductId('/products/123/comment')).toBeNull();
    expect(parseProductId('/products/123/review')).toBeNull();
  });

  it('상세가 아닌 경로는 웹뷰', () => {
    expect(parseProductId('/products/abc')).toBeNull();
    expect(parseProductId('/search?q=1')).toBeNull();
    expect(parseProductId('/')).toBeNull();
  });
});

describe('실제 화면의 파서와 동일해야 한다', () => {
  it('ProductDetailScreen 이 같은 정규식을 쓴다', () => {
    // 위 테스트가 검사하는 규칙이 화면 코드와 갈라지면 의미가 없어진다.
    // 화면을 import 하면 RN 의존이 딸려오므로 소스 텍스트로 확인한다.
    const src: string = require('fs').readFileSync(
      'src/screens/detail/ProductDetailScreen.tsx',
      'utf8',
    );
    expect(src).toContain('/^\\/products\\/(\\d+)\\/?$/');
  });
});
