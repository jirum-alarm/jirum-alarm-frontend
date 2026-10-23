import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { visibleHotDealType, priceSavingLabel } = require('./product-card.ts') as typeof import('./product-card');

test('유통기한 띠가 있으면 핫딜 배지를 숨긴다(같은 자리)', () => {
  assert.equal(visibleHotDealType('SUPER', '2026-11-01'), null);
});

test('띠가 없으면 등급 그대로, 등급이 없으면 null', () => {
  assert.equal(visibleHotDealType('HOT', null), 'HOT');
  assert.equal(visibleHotDealType(null, undefined), null);
  assert.equal(visibleHotDealType('', null), null);
});

test('기준가 대비 라벨 — 기준별 문구 + 내린 정수 %, 모르는 기준·0 이하·없음은 null', () => {
  assert.equal(priceSavingLabel({ basis: 'COUPANG', percent: 21 }), '쿠팡보다 21%↓');
  assert.equal(priceSavingLabel({ basis: 'DANAWA', percent: 19.8 }), '다나와보다 19%↓');
  assert.equal(priceSavingLabel({ basis: 'USUAL', percent: 11 }), '평소보다 11%↓');
  assert.equal(priceSavingLabel({ basis: 'NAVER', percent: 11 }), null);
  assert.equal(priceSavingLabel({ basis: 'USUAL', percent: 0 }), null);
  assert.equal(priceSavingLabel(null), null);
});

test('좁은 사진용 compact 라벨 — 「보다」를 뺀다', () => {
  assert.equal(priceSavingLabel({ basis: 'COUPANG', percent: 21 }, 'compact'), '쿠팡 21%↓');
  assert.equal(priceSavingLabel({ basis: 'USUAL', percent: 11.9 }, 'compact'), '평소 11%↓');
  assert.equal(priceSavingLabel({ basis: 'NAVER', percent: 11 }, 'compact'), null);
});
