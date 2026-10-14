import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  formatPriceDiff,
  liveAlternativeKindLabel,
  summarizeLiveAlternatives,
} from './live-alternatives.ts';

test('같은 상품이 더 싸면 가장 큰 차이를 부제에 쓴다', () => {
  const s = summarizeLiveAlternatives([
    { kind: 'same', priceDiff: -1000 },
    { kind: 'same', priceDiff: -2500 },
    { kind: 'related', priceDiff: null },
  ]);
  assert.equal(s.title, '같은 상품이 더 싸게 올라왔어요');
  assert.equal(s.subtitle, '지금 진행 중인 딜 중 최대 2,500원 더 싸요');
});

test('같은 상품이 전부 비싸면 지금 딜이 더 싸다고 말한다', () => {
  const s = summarizeLiveAlternatives([
    { kind: 'same', priceDiff: 2000 },
    { kind: 'related' },
  ]);
  assert.equal(s.title, '지금 보는 딜이 더 싸요');
});

test('값을 비교할 수 없으면 판매처 비교로', () => {
  assert.equal(
    summarizeLiveAlternatives([{ kind: 'same', priceDiff: null }]).title,
    '같은 상품, 다른 곳에서도 진행 중',
  );
});

test('같은 라인뿐이면 비슷한 상품이라고 말한다', () => {
  assert.equal(summarizeLiveAlternatives([{ kind: 'related' }]).title, '비슷한 상품도 진행 중이에요');
});

test('차이 표기·종류 표기', () => {
  assert.deepEqual(formatPriceDiff(-1500), { text: '1,500원 더 싸요', cheaper: true });
  assert.deepEqual(formatPriceDiff(3000), { text: '+3,000원', cheaper: false });
  assert.equal(formatPriceDiff(0), null);
  assert.equal(formatPriceDiff(null), null);
  assert.equal(liveAlternativeKindLabel('same'), '같은 상품');
  assert.equal(liveAlternativeKindLabel('related'), '비슷한 상품');
});
