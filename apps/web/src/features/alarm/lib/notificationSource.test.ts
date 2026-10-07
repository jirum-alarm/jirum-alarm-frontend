import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { matchMyKeyword, notificationSource } =
  require('./notificationSource.ts') as typeof import('./notificationSource');

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
