import assert from 'node:assert/strict';
import { test } from 'node:test';

import { headline, unitPriceShort, unitPriceText, watchCondition } from './copy.ts';

import type { WaitEstimate } from './types.ts';

const NOW = Date.parse('2026-10-15T12:00:00+09:00');

const base: WaitEstimate = {
  label: '삼다수 2L',
  kind: 'PRODUCT',
  keyword: '삼다수',
  candidates: [{ keyword: '삼다수', dealCount: 96 }],
  excludeKeywords: [],
  unit: 'LITER',
  priceFloor: null,
  priceCeiling: null,
  verdict: 'WAIT',
  confident: true,
  dealCount: 96,
  rawMatchCount: 289,
  windowDays: 90,
  p10: 380,
  median: 441,
  goodPrice: 410,
  goodDays: 17,
  typicalGapDays: 3,
  lastGoodAt: '2026-10-13T10:00:00+09:00',
  current: null,
  currentPercentile: null,
  goodDealCount: 19,
  goodDeals: [],
  liveDeals: [],
  points: [],
};

test('단위가 문구', () => {
  assert.equal(unitPriceText('LITER', 410), '1L당 410원');
  assert.equal(unitPriceText('FACE_VALUE', 0.923), '액면가의 92%');
  assert.equal(unitPriceText('TOTAL', 289000), '289,000원');
  assert.equal(unitPriceShort('TOTAL', 289000), '28.9만');
});

test('WAIT — 기다릴 날·근거', () => {
  const h = headline(base, NOW);
  assert.equal(h.tone, 'wait');
  assert.equal(h.title, '1일쯤 더 기다려 보세요');
  assert.match(h.sub, /1L당 410원 이하가 90일 중 17일/);
  assert.match(h.sub, /마지막 2일 전/);
});

test('BUY_NOW — 지금 가격을 말한다', () => {
  const current = {
    id: 1,
    title: '삼다수 2L 24병',
    price: 18_000,
    unitPrice: 375,
    postedAt: '2026-10-15T09:00:00+09:00',
    isEnd: false,
  };
  const h = headline({ ...base, verdict: 'BUY_NOW', current }, NOW);
  assert.equal(h.tone, 'buy');
  assert.match(h.sub, /지금 1L당 375원/);
});

test('섞였으면 단정하지 않고, 카테고리는 판정 대신 되묻는다', () => {
  assert.match(headline({ ...base, confident: false }, NOW).sub, /섞여 있을 수/);
  assert.equal(headline({ ...base, kind: 'CATEGORY' }, NOW).tone, 'unknown');
});

test('WAIT — 마지막 뒤 보통 간격이 지났으면 「올 때가 됐어요」', () => {
  assert.equal(
    headline({ ...base, lastGoodAt: '2026-10-05T10:00:00+09:00' }, NOW).title,
    '좋은 가격이 올 때가 됐어요',
  );
});

test('알림 조건 — 총액·같은 물건 비교일 때만 좋은 가격을 상한으로', () => {
  assert.equal(watchCondition(base).maxPrice, null);
  const total = { ...base, unit: 'TOTAL' as const, goodPrice: 290_000, priceFloor: 150_000 };
  assert.equal(watchCondition(total).maxPrice, 290_000);
  assert.equal(watchCondition({ ...total, kind: 'CATEGORY' }).maxPrice, null);
  assert.equal(watchCondition({ ...total, confident: false }).maxPrice, null);
});
