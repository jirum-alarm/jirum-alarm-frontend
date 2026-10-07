import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { formatPriceInput, parseExcludeKeywords, parsePrice, summarizeKeywordAlert } =
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

  it('입력칸은 쉼표를 찍어 보여준다', () => {
    assert.equal(formatPriceInput('1000000'), '1,000,000');
    assert.equal(formatPriceInput('15,0000원'), '150,000');
    assert.equal(formatPriceInput('abc'), '');
  });
});

describe('summarizeKeywordAlert', () => {
  it('아무 조건도 없으면 "새 핫딜 모두"', () => {
    assert.equal(
      summarizeKeywordAlert({
        priceDropOnly: false,
        excludeKeywords: [],
        minPrice: null,
        maxPrice: null,
      }),
      '새 핫딜 모두',
    );
  });

  it('가격 범위는 한쪽만 있으면 이상/이하로 읽는다', () => {
    const base = { priceDropOnly: true, excludeKeywords: ['케이스', '필름'] };
    assert.equal(
      summarizeKeywordAlert({ ...base, minPrice: null, maxPrice: 1000000 }),
      '평소보다 쌀 때만 · 100만원 이하 · ‘케이스’ 외 1개 제외',
    );
    assert.equal(
      summarizeKeywordAlert({
        ...base,
        excludeKeywords: ['케이스'],
        minPrice: 15000,
        maxPrice: null,
      }),
      '평소보다 쌀 때만 · 15,000원 이상 · ‘케이스’ 제외',
    );
    assert.equal(
      summarizeKeywordAlert({ ...base, excludeKeywords: [], minPrice: 100000, maxPrice: 200000 }),
      '평소보다 쌀 때만 · 10만원~20만원',
    );
  });
});
