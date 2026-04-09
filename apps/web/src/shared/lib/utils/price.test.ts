import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { parsePrice } = require('./price.ts') as typeof import('./price');

test('숫자 문자열 가격도 원 단위로 표시할 수 있도록 처리한다', () => {
  const { hasWon, priceWithoutWon } = parsePrice('12900');

  assert.equal(hasWon, true);
  assert.equal(priceWithoutWon, '12,900');
});

test('이미 원이 포함된 가격 문자열은 기존과 동일하게 처리한다', () => {
  const { hasWon, priceWithoutWon } = parsePrice('12,900원');

  assert.equal(hasWon, true);
  assert.equal(priceWithoutWon, '12,900');
});

test('숫자 가격도 원 단위로 표시할 수 있도록 처리한다', () => {
  const { hasWon, priceWithoutWon } = parsePrice(12900);

  assert.equal(hasWon, true);
  assert.equal(priceWithoutWon, '12,900');
});

test('가격이 아닌 문자열은 원 단위를 강제로 붙이지 않는다', () => {
  const { hasWon, priceWithoutWon } = parsePrice('커뮤니티 확인');

  assert.equal(hasWon, false);
  assert.equal(priceWithoutWon, '커뮤니티 확인');
});
