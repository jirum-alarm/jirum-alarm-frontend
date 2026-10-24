import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { MYPAGE_GROUPS, MYPAGE_MENU, mobileMenuOf, themeSubscriberLabel } =
  require('./mypage.ts') as typeof import('./mypage');

const mobileTitles = () => MYPAGE_GROUPS.flatMap((g) => mobileMenuOf(g.key).map((i) => i.title));

test('모바일 목록(web 모바일·앱 내정보) — 묶음 순서대로 6줄', () => {
  assert.deepEqual(mobileTitles(), [
    '찜 목록',
    '키워드 알림',
    '관심 카테고리',
    '알림 설정',
    '사용법 · 자주 묻는 질문',
    '약관 및 정책',
  ]);
});

test('키워드 알림이 맞춤 설정 맨 위 — 가장 자주 여는 설정(2026-10-07)', () => {
  assert.equal(mobileMenuOf('custom')[0].key, 'keyword');
});

test('PC 전용은 알림 하나 — 모바일은 하단 탭으로 간다', () => {
  assert.deepEqual(
    MYPAGE_MENU.filter((i) => 'pcOnly' in i && i.pcOnly).map((i) => i.key),
    ['alarm'],
  );
});

test('키는 겹치지 않는다(앱·web 이 키로 아이콘·이동을 붙인다)', () => {
  const keys = MYPAGE_MENU.map((i) => i.key);
  assert.equal(new Set(keys).size, keys.length);
});

test('관심사 «N명이 받고 있어요»는 10명부터 — 적은 숫자는 숨긴다(2026-10-24)', () => {
  assert.equal(themeSubscriberLabel(0), null);
  assert.equal(themeSubscriberLabel(9), null);
  assert.equal(themeSubscriberLabel(10), '10명이 받고 있어요');
  assert.equal(themeSubscriberLabel(132), '132명이 받고 있어요');
});
