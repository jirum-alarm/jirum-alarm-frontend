import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { parsePrice } = require('./price.ts') as typeof import('./price');

/** 호출부(DisplayListPrice·DisplayPrice)가 하는 조립을 그대로 재현해 최종 화면 문자열을 만든다. */
const render = (price: Parameters<typeof parsePrice>[0]) => {
  const { hasWon, priceWithoutWon } = parsePrice(price);
  return hasWon ? `${priceWithoutWon}원` : priceWithoutWon;
};

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

// --- 아래는 운영 260건 전수조사(2026-08-06)에서 실제로 나온 비정형 문자열 ---

test('원이 중간에 있어도 뒤에 원을 덧붙이지 않는다', () => {
  // 옛 구현: '￦ 8,780 (KRW)원' — 첫 '원'만 지우고 hasWon=true 라 원이 다시 붙었다.
  assert.equal(render('￦ 8,780원 (KRW)'), '8,780원');
  assert.equal(render('24,963원부터'), '24,963원');
});

test('원화 표기가 섞인 비정형 문자열에서 숫자를 뽑아 원으로 표기한다', () => {
  assert.equal(render('￦ 2,290 (KRW)'), '2,290원');
  assert.equal(render('￦ 435,880 (KRW)'), '435,880원');
  assert.equal(render('￦ 2,007,800 (KRW)'), '2,007,800원');
  assert.equal(render('￦ 15,942 (KRW)'), '15,942원');
});

test('카드사 접두가 붙은 가격도 숫자만 남긴다', () => {
  assert.equal(render('삼성카드46,080'), '46,080원');
  assert.equal(render('삼카36,770'), '36,770원');
  assert.equal(render('카드13,840'), '13,840원');
});

test('외화 표기는 원을 붙이지 않고 원문을 유지한다', () => {
  // 원을 붙이면 2.67달러가 2.67원으로 오표기된다.
  assert.equal(render('$ 2.67 (USD)'), '$ 2.67 (USD)');
  assert.equal(render('$27.94'), '$27.94');
});

test('숫자가 없는 문자열은 가격이 아니므로 원을 붙이지 않는다', () => {
  assert.equal(render('선택'), '선택');
});

test('값이 없으면 커뮤니티 확인으로 흡수한다', () => {
  assert.equal(render(null), '커뮤니티 확인');
  assert.equal(render(undefined), '커뮤니티 확인');
  assert.equal(render(''), '커뮤니티 확인');
});

test('어떤 입력에도 원이 두 번 붙지 않는다', () => {
  const samples = [
    '12,900원',
    '12900',
    '￦ 8,780원 (KRW)',
    '24,963원부터',
    '삼성카드46,080',
    '￦ 2,290 (KRW)',
    '$ 2.67 (USD)',
    '선택',
    '0원',
    '5원',
    null,
    12900,
  ];

  for (const sample of samples) {
    assert.ok(!render(sample).includes('원원'), `원 중복: ${String(sample)}`);
  }
});
