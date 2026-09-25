import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

/**
 * 로그아웃이 푸시 토큰을 계정에서 떼는지 — 그리고 인증 쿠키를 지우기 **전에** 떼는지.
 * 떼지 않으면 로그아웃한 브라우저로 이전 계정의 키워드 알림이 계속 간다.
 * 훅은 node --test 로 못 돌려서(서버 액션·next 의존) 소스 순서로 고정한다.
 */
const source = readFileSync(new URL('./useLogout.ts', import.meta.url), 'utf8');

test('logout 은 removeTokenLinkage 를 부른다', () => {
  assert.match(source, /NotificationService\.removeTokenLinkage\(\{ token \}\)/);
});

test('토큰 떼기가 access/refresh 쿠키 삭제보다 먼저다', () => {
  const body = source.slice(source.indexOf('const logout = async'));
  const unlink = body.indexOf('await unlinkPushToken()');
  assert.ok(unlink >= 0, 'logout 안에서 unlinkPushToken 을 부르지 않는다');
  assert.ok(unlink < body.indexOf('await removeRefreshToken()'));
  assert.ok(unlink < body.indexOf('await removeAccessToken()'));
});
