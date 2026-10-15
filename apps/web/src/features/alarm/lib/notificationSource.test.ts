import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const {
  goodPriceText,
  matchMyKeyword,
  notificationSource,
  recentKeywordAlertCount,
  topKeywordToday,
} = require('./notificationSource.ts') as typeof import('./notificationSource');

const mine = new Set(['햇반', '펩시']);
const themes = [{ id: '3', name: '생수·음료 쟁이기' }];

test('키워드·가격 하락 → 키워드 설정, 관심사 제목 → 관심사 화면, 좋은 딜 → 알림 설정', () => {
  assert.deepEqual(notificationSource('햇반 평소보다 54% 싸게 떴어요 📉', mine, themes), {
    kind: 'keyword',
    label: '햇반 키워드 알림',
    href: '/mypage/keyword?focus=%ED%96%87%EB%B0%98',
  });
  assert.deepEqual(notificationSource('🥤 [생수·음료 쟁이기] 펩시 핫딜', mine, themes), {
    kind: 'theme',
    label: '생수·음료 쟁이기 관심사 알림',
    href: '/themes/3',
  });
  assert.equal(
    notificationSource('🔥 지금 뜨는 좋은 딜', mine, themes)?.href,
    '/mypage/notification',
  );
});

test('지운 키워드·없어진 관심사·빈 값은 링크 없음', () => {
  assert.equal(notificationSource('삼다수', mine, themes), undefined);
  assert.equal(notificationSource('🍜 [없어진 관심사] 라면 핫딜', mine, themes), undefined);
  assert.equal(notificationSource(null, mine, themes), undefined);
});

const keywordSet = new Set(['햇반', '에어팟', '에어팟 프로', '콜라']);

test('키워드 그대로·가격 하락 문구는 내 키워드로, 관심사 제목·지운 키워드는 안 맞는다', () => {
  assert.equal(matchMyKeyword('햇반', keywordSet), '햇반');
  assert.equal(matchMyKeyword('햇반 평소보다 54% 싸게 떴어요 📉', keywordSet), '햇반');
  assert.equal(
    matchMyKeyword('에어팟 프로 평소보다 10% 싸게 떴어요 📉', keywordSet),
    '에어팟 프로',
  );
  assert.equal(matchMyKeyword('🥤 [생수·음료 쟁이기] 콜라 핫딜', keywordSet), undefined);
  assert.equal(matchMyKeyword('콜라겐', keywordSet), undefined);
  assert.equal(matchMyKeyword('노트북', keywordSet), undefined);
  assert.equal(matchMyKeyword(null, keywordSet), undefined);
});

const NOW = new Date('2026-10-14T12:00:00Z').getTime();
const hoursAgo = (h: number): string => new Date(NOW - h * 3600_000).toISOString();

test('최근 24시간의 내 키워드 알림만 센다(관심사·좋은 딜·지난 날은 빼고)', () => {
  const mine: Set<string> = new Set(['콜라', '에어팟 프로']);
  const notifications = [
    { keyword: '콜라', createdAt: hoursAgo(1) },
    { keyword: '콜라 최근 딜보다 싸게 떴어요 📉', createdAt: hoursAgo(2) },
    { keyword: '에어팟 프로', createdAt: hoursAgo(23) },
    { keyword: '콜라', createdAt: hoursAgo(25) },
    { keyword: '🥤 [생수·음료 쟁이기] 펩시 핫딜', createdAt: hoursAgo(1) },
    { keyword: '(광고) 🔥 지금 뜨는 좋은 딜', createdAt: hoursAgo(1) },
    { keyword: null, createdAt: hoursAgo(1) },
  ];
  assert.equal(recentKeywordAlertCount(notifications, mine, NOW), 3);
});

test('오늘 가장 많이 온 내 키워드 — 하락 문구도 그 키워드로, 24시간 밖·남의 키워드는 뺀다', () => {
  const now = Date.parse('2026-10-15T12:00:00Z');
  const at = (h: number) => new Date(now - h * 3600_000).toISOString();
  const top = topKeywordToday(
    [
      { keyword: '펩시', createdAt: at(1) },
      { keyword: '펩시 평소보다 12% 싸게 떴어요 📉', createdAt: at(2) },
      { keyword: '햇반', createdAt: at(3) },
      { keyword: '펩시', createdAt: at(30) },
      { keyword: '🥤 [생수·음료 쟁이기] 펩시 핫딜', createdAt: at(1) },
    ],
    mine,
    now,
  );
  assert.deepEqual(top, { keyword: '펩시', count: 2 });
  assert.equal(topKeywordToday([], mine, now), undefined);
});

test('좋은 가격 문구', () => {
  assert.equal(goodPriceText('LITER', 1400), '1L당 1,400원');
  assert.equal(goodPriceText('FACE_VALUE', 0.923), '액면가의 92%');
  assert.equal(goodPriceText('TOTAL', 289000), '289,000원');
});
