import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { ctaVisibilityOf } = require('./cta-visibility.ts') as typeof import('./cta-visibility');

const size = { rectWidth: 300, rectHeight: 48 };

test('화면 안이면 full, 아래로 걸치면 partial, 완전히 밑이면 hidden', () => {
  const vp = { ...size, viewportTop: 0, viewportHeight: 700 };
  assert.equal(ctaVisibilityOf({ ...vp, rectTop: 640, rectBottom: 688 }), 'full');
  assert.equal(ctaVisibilityOf({ ...vp, rectTop: 680, rectBottom: 728 }), 'partial');
  assert.equal(ctaVisibilityOf({ ...vp, rectTop: 720, rectBottom: 768 }), 'hidden');
});

test('핀치 확대로 visual viewport 가 내려가 있으면 그 기준으로 본다', () => {
  assert.equal(
    ctaVisibilityOf({
      ...size,
      viewportTop: 300,
      viewportHeight: 400,
      rectTop: 640,
      rectBottom: 688,
    }),
    'full',
  );
});

test('크기 0 이면 그려지지 않은 것(삼성 인터넷이 숨긴 경우) — 예전엔 full 로 잘못 셌다', () => {
  assert.equal(
    ctaVisibilityOf({
      rectWidth: 0,
      rectHeight: 0,
      rectTop: 0,
      rectBottom: 0,
      viewportTop: 0,
      viewportHeight: 700,
    }),
    'not_rendered',
  );
});
