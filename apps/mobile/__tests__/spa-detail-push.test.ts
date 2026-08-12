export {};

const {getPushablePath} = require('../src/shared/lib/navigation/tab-routing');

/**
 * useSpaDetailPush 의 판정 규칙.
 *
 * 웹이 pushState 로 URL 만 바꾸면 onShouldStartLoadWithRequest 가 발화하지 않아
 * 상세가 웹뷰 안에서 그려진다(광고 포함). onNavigationStateChange 로 건지되,
 * 같은 경로를 두 번 올리면 뒤로가기 때 무한 push 가 된다.
 */
function makePusher() {
  let lastPushed: string | null = null;
  const pushed: string[] = [];
  return {
    pushed,
    onUrl(url: string) {
      const path = getPushablePath(url);
      if (!path) {
        lastPushed = null;
        return;
      }
      if (lastPushed === path) return;
      lastPushed = path;
      pushed.push(path);
    },
  };
}

const HOME = 'https://jirum-alarm.com/';
const A = 'https://jirum-alarm.com/products/111';
const B = 'https://jirum-alarm.com/products/222';

describe('SPA 상세 진입 감지', () => {
  it('상세 URL 이면 네이티브로 올린다', () => {
    const p = makePusher();
    p.onUrl(A);
    expect(p.pushed).toEqual(['/products/111']);
  });

  // 같은 URL 이 여러 번 통지되는 건 정상이다(로드 단계마다 발화).
  it('같은 경로를 연속으로 받아도 한 번만 올린다', () => {
    const p = makePusher();
    p.onUrl(A);
    p.onUrl(A);
    p.onUrl(A);
    expect(p.pushed).toEqual(['/products/111']);
  });

  // 뒤로가기로 홈에 돌아온 뒤 같은 상품을 다시 누르면 또 열려야 한다.
  it('상세를 벗어났다가 다시 들어오면 다시 올린다', () => {
    const p = makePusher();
    p.onUrl(A);
    p.onUrl(HOME);
    p.onUrl(A);
    expect(p.pushed).toEqual(['/products/111', '/products/111']);
  });

  it('다른 상품으로 이동하면 각각 올린다', () => {
    const p = makePusher();
    p.onUrl(A);
    p.onUrl(B);
    expect(p.pushed).toEqual(['/products/111', '/products/222']);
  });

  it('상세가 아닌 경로는 올리지 않는다', () => {
    const p = makePusher();
    p.onUrl(HOME);
    p.onUrl('https://jirum-alarm.com/search?q=x');
    p.onUrl('https://jirum-alarm.com/alarm');
    expect(p.pushed).toEqual([]);
  });

  // 쿼리스트링이 붙어도 같은 상품이면 중복 push 하지 않는다.
  it('쿼리가 달라지면 별개 경로로 취급한다', () => {
    const p = makePusher();
    p.onUrl(A);
    p.onUrl(A + '?from=home');
    expect(p.pushed).toEqual(['/products/111', '/products/111?from=home']);
  });
});
