import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { matchMyKeyword } = require('./matchMyKeyword.ts') as typeof import('./matchMyKeyword');

const mine = new Set(['햇반', '에어팟', '에어팟 프로', '콜라']);

test('키워드 그대로·가격 하락 문구는 내 키워드로, 관심사 제목·지운 키워드는 안 맞는다', () => {
  assert.equal(matchMyKeyword('햇반', mine), '햇반');
  assert.equal(matchMyKeyword('햇반 평소보다 54% 싸게 떴어요 📉', mine), '햇반');
  assert.equal(matchMyKeyword('에어팟 프로 평소보다 10% 싸게 떴어요 📉', mine), '에어팟 프로');
  assert.equal(matchMyKeyword('🥤 [생수·음료 쟁이기] 콜라 핫딜', mine), undefined);
  assert.equal(matchMyKeyword('콜라겐', mine), undefined);
  assert.equal(matchMyKeyword('노트북', mine), undefined);
  assert.equal(matchMyKeyword(null, mine), undefined);
});
