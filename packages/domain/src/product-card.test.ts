import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { visibleHotDealType } = require('./product-card.ts') as typeof import('./product-card');

test('유통기한 띠가 있으면 핫딜 배지를 숨긴다(같은 자리)', () => {
  assert.equal(visibleHotDealType('SUPER', '2026-11-01'), null);
});

test('띠가 없으면 등급 그대로, 등급이 없으면 null', () => {
  assert.equal(visibleHotDealType('HOT', null), 'HOT');
  assert.equal(visibleHotDealType(null, undefined), null);
  assert.equal(visibleHotDealType('', null), null);
});
