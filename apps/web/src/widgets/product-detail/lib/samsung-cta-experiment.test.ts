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

test('삼성 인터넷은 늘 버튼', () => {
  assert.equal(pickCtaVariant(SAMSUNG), 'button');
});

test('다른 브라우저는 링크(null)', () => {
  assert.equal(pickCtaVariant(CHROME), null);
});
