import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { resolveAppDownloadPlatform } =
  require('./resolvePlatform.ts') as typeof import('./resolvePlatform');

test('맥 데스크톱은 non-mobile — isApple(Macintosh 포함)에 속지 않는다', () => {
  assert.equal(
    resolveAppDownloadPlatform({ isMobileBrowser: false, isApple: true, isAndroid: false }),
    'non-mobile',
  );
});

test('아이폰은 apple', () => {
  assert.equal(
    resolveAppDownloadPlatform({ isMobileBrowser: true, isApple: true, isAndroid: false }),
    'apple',
  );
});

test('안드로이드폰은 android', () => {
  assert.equal(
    resolveAppDownloadPlatform({ isMobileBrowser: true, isApple: false, isAndroid: true }),
    'android',
  );
});

test('윈도우 PC와 device 미확정은 non-mobile', () => {
  assert.equal(
    resolveAppDownloadPlatform({ isMobileBrowser: false, isApple: false, isAndroid: false }),
    'non-mobile',
  );
  assert.equal(resolveAppDownloadPlatform(null), 'non-mobile');
});
