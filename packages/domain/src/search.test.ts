import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const {
  hasActiveSearchFilters,
  isPrefixValid,
  periodStartDate,
  PERIOD_LABELS,
  SEARCH_PERIODS,
  searchFilterVariables,
  SEARCH_CORRECTED_COPY,
} = require('./search.ts') as typeof import('./search');

test('기간은 지금부터 N시간 전(롤링) — 자정 절단이 아니다', () => {
  const now = Date.UTC(2026, 9, 20, 15, 30);
  assert.equal(periodStartDate('all', now), undefined);
  assert.equal(periodStartDate('1d', now), new Date(now - 24 * 3600_000).toISOString());
  assert.equal(periodStartDate('30d', now), new Date(now - 30 * 24 * 3600_000).toISOString());
});

test('기간 후보마다 라벨이 있다', () => {
  assert.deepEqual(Object.keys(PERIOD_LABELS), [...SEARCH_PERIODS]);
});

test('자동완성 — 한글은 1자, 그 밖은 2자부터, 공백만이면 안 부른다', () => {
  assert.equal(isPrefixValid('ㄱ'), false); // 자모만으론 한글 음절이 아니다(가-힣) — 2자부터
  assert.equal(isPrefixValid('가'), true);
  assert.equal(isPrefixValid('a'), false);
  assert.equal(isPrefixValid('ab'), true);
  assert.equal(isPrefixValid('   '), false);
});

test('초기화 버튼 — 정렬만 바꾼 건 필터로 세지 않는다', () => {
  const none = { categoryIds: [], providerIds: [], ended: false, period: 'all' as const };
  assert.equal(hasActiveSearchFilters(none), false);
  assert.equal(hasActiveSearchFilters({ ...none, period: '7d' }), true);
  assert.equal(hasActiveSearchFilters({ ...none, ended: true }), true);
  assert.equal(hasActiveSearchFilters({ ...none, categoryIds: [1] }), true);
});

test('오타 교정 — exact 가 켜졌을 때만 exactKeyword 를 보내고, 안내 문구는 교정어·원래 말을 그대로 품는다', () => {
  const base = { categoryIds: [], providerIds: [], ended: false, sort: 'recent' as const };
  assert.equal(searchFilterVariables(base, undefined).exactKeyword, undefined);
  assert.equal(searchFilterVariables({ ...base, exact: true }, undefined).exactKeyword, true);
  assert.equal(SEARCH_CORRECTED_COPY.shown('낫또'), '‘낫또’ 검색 결과예요');
  assert.equal(SEARCH_CORRECTED_COPY.searchOriginal('낫뗘'), '‘낫뗘’ 그대로 검색');
});
