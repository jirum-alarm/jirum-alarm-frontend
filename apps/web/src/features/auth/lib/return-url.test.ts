import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

// tsc 는 '.ts' 확장자 import 를 거부하고(allowImportingTsExtensions off), node --test 는
// 확장자 없는 ESM 경로를 못 찾는다 → 이 레포의 다른 테스트와 같은 createRequire 패턴을 쓴다.
// (이 파일은 확장자 없는 import 때문에 그동안 조용히 실패하고 있었다.)
const require = createRequire(import.meta.url);
const { resolveReturnUrl } = require('./return-url.ts') as typeof import('./return-url');

const ORIGIN = 'https://jirum-alarm.com';

test('빈 값이면 홈', () => {
  assert.deepEqual(resolveReturnUrl(null, ORIGIN), { kind: 'internal', path: '/' });
  assert.deepEqual(resolveReturnUrl('', ORIGIN), { kind: 'internal', path: '/' });
});

test('상대 경로는 내부 이동', () => {
  assert.deepEqual(resolveReturnUrl('/products/1', ORIGIN), {
    kind: 'internal',
    path: '/products/1',
  });
});

test('같은 오리진 절대 URL 은 경로만 뽑아 내부 이동', () => {
  assert.deepEqual(resolveReturnUrl(`${ORIGIN}/mypage?tab=keyword`, ORIGIN), {
    kind: 'internal',
    path: '/mypage?tab=keyword',
  });
});

test('★ai 서브도메인은 external — 이게 안 되면 로그인 후 ai 로 복귀 못 한다', () => {
  const target = 'https://ai.jirum-alarm.com/c/new?q=%EB%9D%BC%EB%A9%B4';
  assert.deepEqual(resolveReturnUrl(target, ORIGIN), { kind: 'external', url: target });
});

test('한 번 인코딩된 값도 푼다', () => {
  const target = 'https://ai.jirum-alarm.com/c/abc';
  assert.deepEqual(resolveReturnUrl(encodeURIComponent(target), ORIGIN), {
    kind: 'external',
    url: target,
  });
});

test('★오픈 리다이렉트 차단 — 외부 호스트는 홈으로', () => {
  for (const evil of [
    'https://evil.com/steal',
    '//evil.com',
    'https://jirum-alarm.com.evil.com/x',
    'javascript:alert(1)',
  ]) {
    assert.deepEqual(
      resolveReturnUrl(evil, ORIGIN),
      { kind: 'internal', path: '/' },
      `차단 실패: ${evil}`,
    );
  }
});
