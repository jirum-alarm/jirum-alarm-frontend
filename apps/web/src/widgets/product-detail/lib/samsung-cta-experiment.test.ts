import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { pickCtaVariant } =
  require('./samsung-cta-experiment.ts') as typeof import('./samsung-cta-experiment');

const SAMSUNG =
  'Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/30.0 Chrome/138.0.0.0 Mobile Safari/537.36';
const CHROME =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';

test('삼성 인터넷만 실험 대상 — 반반으로 나눈다', () => {
  assert.equal(pickCtaVariant(SAMSUNG, 0.1), 'button');
  assert.equal(pickCtaVariant(SAMSUNG, 0.9), 'link');
});

test('다른 브라우저는 실험 밖(null)', () => {
  assert.equal(pickCtaVariant(CHROME, 0.1), null);
});
