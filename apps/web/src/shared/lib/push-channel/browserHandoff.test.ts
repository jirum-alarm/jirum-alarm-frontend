import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { browserHandoffUrl, canHandoffToBrowser, readHandoff } =
  require('./browserHandoff.ts') as typeof import('./browserHandoff');

describe('browserHandoff', () => {
  it('웹 푸시가 없는 안드로이드 인앱만 넘긴다', () => {
    const naverInApp = { isAndroid: true, isInAppBrowser: true, hasNotificationApi: false };
    assert.equal(canHandoffToBrowser(naverInApp), true);
    assert.equal(canHandoffToBrowser({ ...naverInApp, hasNotificationApi: true }), false); // 푸시가 되면 넘길 이유가 없다
    assert.equal(canHandoffToBrowser({ ...naverInApp, isInAppBrowser: false }), false); // 이미 브라우저
    assert.equal(canHandoffToBrowser({ ...naverInApp, isAndroid: false }), false); // iOS 는 intent 가 없다
  });

  it('intent 링크에 기기 id·push 를 싣고, fallback 은 같은 https 주소다', () => {
    const link = browserHandoffUrl('https://jirum-alarm.com/products/1?utm_source=naver', 'dev-1');
    assert.match(
      link,
      /^intent:\/\/jirum-alarm\.com\/products\/1\?utm_source=naver&gd=dev-1&push=1#Intent;scheme=https;/,
    );
    const fallback = decodeURIComponent(link.match(/S\.browser_fallback_url=([^;]+)/)![1]);
    assert.equal(fallback, 'https://jirum-alarm.com/products/1?utm_source=naver&gd=dev-1&push=1');
  });

  it('도착하면 기기 id 를 읽고 주소에서 지운다(다른 쿼리는 남긴다)', () => {
    const r = readHandoff('https://jirum-alarm.com/products/1?utm_source=naver&gd=dev-1&push=1');
    assert.deepEqual(r, {
      deviceId: 'dev-1',
      wantsPush: true,
      cleanUrl: '/products/1?utm_source=naver',
    });
    assert.equal(readHandoff('https://jirum-alarm.com/').deviceId, null);
  });
});
