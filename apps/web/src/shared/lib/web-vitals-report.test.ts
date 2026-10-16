import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import type { INPMetricWithAttribution, LCPMetricWithAttribution } from 'web-vitals/attribution';

const require = createRequire(import.meta.url);
const { pageTypeOf, toWebVitalsEvent } =
  require('./web-vitals-report.ts') as typeof import('./web-vitals-report');

test('착지 경로를 화면 종류로 묶는다', () => {
  assert.equal(pageTypeOf('/'), 'home');
  assert.equal(pageTypeOf('/products/123'), 'product');
  assert.equal(pageTypeOf('/search'), 'search');
  assert.equal(pageTypeOf('/what'), 'other');
});

test('INP 는 가장 긴 구간·로드 상태·긴 스크립트 파일을 싣는다', () => {
  const metric = {
    name: 'INP',
    value: 312.4,
    rating: 'needs-improvement',
    navigationType: 'navigate',
    attribution: {
      interactionTarget: 'button.buy',
      inputDelay: 20,
      processingDuration: 250,
      presentationDelay: 40,
      loadState: 'complete',
      longestScript: {
        entry: { sourceURL: 'https://jirum-alarm.com/_next/static/chunks/abc.js?x=1' },
      },
    },
  } as unknown as INPMetricWithAttribution;
  const event = toWebVitalsEvent(metric, '/products/1');
  assert.equal(event.metric_value, 312);
  assert.equal(event.page_type, 'product');
  assert.equal(event.vitals_target, 'button.buy');
  assert.equal(event.vitals_detail, 'processing|complete|jirum-alarm.com/abc.js');
});

test('긴 선택자는 GA4 한도 100자로 자른다', () => {
  const metric = {
    name: 'LCP',
    value: 1200,
    rating: 'good',
    navigationType: 'back-forward-cache',
    attribution: {
      target: 'x'.repeat(300),
      timeToFirstByte: 100,
      resourceLoadDelay: 50,
      resourceLoadDuration: 900,
      elementRenderDelay: 150,
    },
  } as unknown as LCPMetricWithAttribution;
  const event = toWebVitalsEvent(metric, '/');
  assert.equal(event.vitals_target.length, 100);
  assert.equal(event.vitals_detail, 'load');
  assert.equal(event.navigation_type, 'back-forward-cache');
});
