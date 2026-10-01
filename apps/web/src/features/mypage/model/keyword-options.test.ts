import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { parseExcludeKeywords, parsePrice } =
  require('./keyword-options.ts') as typeof import('./keyword-options');

describe('parseExcludeKeywords', () => {
  it('쉼표로 나누고 공백·빈칸·중복을 정리한다', () => {
    assert.deepEqual(parseExcludeKeywords(' 콜라겐, 콜라보 ,,콜라겐 '), ['콜라겐', '콜라보']);
  });

  it('최대 10개까지만 받는다', () => {
    const words = Array.from({ length: 12 }, (_, i) => `단어${i}`).join(',');
    assert.equal(parseExcludeKeywords(words).length, 10);
  });
});

describe('parsePrice', () => {
  it('숫자만 남겨 원 단위로, 비면 null', () => {
    assert.equal(parsePrice('1,000,000원'), 1000000);
    assert.equal(parsePrice('  '), null);
  });
});
