import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { decideAuthAction, isProtectedPath } =
  require('./auth-route.ts') as typeof import('./auth-route');

// auth-route 는 PAGE enum 을 import 하지 않고 경로를 리터럴로 갖는다(--experimental-strip-types
// 가 enum 을 못 지워서 테스트에서 page.ts 를 로드할 수 없다). 값이 어긋나면 보호 경로가
// 조용히 열리므로, PAGE.MYPAGE/PAGE.LIKE 를 바꿀 때 이 단정도 같이 바꿔야 한다.
describe('보호 경로', () => {
  it('mypage / like 를 보호한다', () => {
    assert.equal(isProtectedPath('/mypage'), true);
    assert.equal(isProtectedPath('/like'), true);
    assert.equal(isProtectedPath('/'), false);
  });
});

describe('decideAuthAction', () => {
  it('액세스 토큰이 있으면 아무것도 하지 않는다', () => {
    for (const pathname of ['/', '/mypage', '/products/1']) {
      assert.equal(
        decideAuthAction({ pathname, hasAccessToken: true, hasRefreshToken: true }),
        'pass',
      );
    }
  });

  // 회귀 방지: 예전엔 mypage/like/trending 에서만 갱신해서, 홈이나 상세로 재방문하면
  // 만료된 채 방치되고 SSR 이 401 → 로그인으로 튕겼다(1시간마다 로그아웃).
  it('액세스 토큰만 만료됐으면 보호 경로가 아니어도 갱신한다', () => {
    for (const pathname of ['/', '/products/1', '/community', '/deals', '/search']) {
      assert.equal(
        decideAuthAction({ pathname, hasAccessToken: false, hasRefreshToken: true }),
        'refresh',
        `${pathname} 에서 갱신되지 않음`,
      );
    }
  });

  it('보호 경로에서도 갱신 가능하면 리다이렉트 대신 갱신한다', () => {
    assert.equal(
      decideAuthAction({ pathname: '/mypage', hasAccessToken: false, hasRefreshToken: true }),
      'refresh',
    );
  });

  it('토큰이 전혀 없으면 보호 경로만 로그인으로 보낸다', () => {
    const noTokens = { hasAccessToken: false, hasRefreshToken: false };
    assert.equal(decideAuthAction({ pathname: '/mypage', ...noTokens }), 'redirect');
    assert.equal(decideAuthAction({ pathname: '/like', ...noTokens }), 'redirect');
    assert.equal(decideAuthAction({ pathname: '/mypage/keyword', ...noTokens }), 'redirect');
  });

  it('비로그인 유저의 공개 경로는 통과시킨다', () => {
    const noTokens = { hasAccessToken: false, hasRefreshToken: false };
    for (const pathname of ['/', '/products/1', '/login', '/deals', '/trending']) {
      assert.equal(decideAuthAction({ pathname, ...noTokens }), 'pass', `${pathname} 가 차단됨`);
    }
  });
});
