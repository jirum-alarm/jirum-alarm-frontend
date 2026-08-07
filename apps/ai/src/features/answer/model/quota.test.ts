import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isBlocked, nextTier, QUOTA, remaining, shouldWarn } from './quota.ts';

test('remaining 은 음수로 내려가지 않는다', () => {
  assert.equal(remaining({ tier: 'anon', used: 0 }), 3);
  assert.equal(remaining({ tier: 'anon', used: 3 }), 0);
  // 서버 강제 전이라 used 가 limit 을 넘을 수 있다 — "-2회 남음" 은 나오면 안 된다
  assert.equal(remaining({ tier: 'anon', used: 5 }), 0);
});

test('벽은 정확히 limit 에서 닿는다 — 마지막 1회는 아직 쓸 수 있다', () => {
  assert.equal(isBlocked({ tier: 'member', used: 9 }), false);
  assert.equal(isBlocked({ tier: 'member', used: 10 }), true);
});

test('익명은 처음부터 남은 횟수를 알린다', () => {
  // 3회뿐이라 "언제 끝나는지" 를 처음부터 보여줘야 로그인 유인이 생긴다
  assert.equal(shouldWarn({ tier: 'anon', used: 0 }), true);
});

test('로그인은 막바지에만 알린다 — 10회 내내 카운터를 띄우지 않는다', () => {
  assert.equal(shouldWarn({ tier: 'member', used: 0 }), false);
  assert.equal(shouldWarn({ tier: 'member', used: 7 }), true);
});

test('벽에 닿으면 경고 대신 벽 카드가 뜬다 — 둘이 동시에 뜨지 않는다', () => {
  const wall = { tier: 'anon', used: 3 } as const;
  assert.equal(isBlocked(wall), true);
  assert.equal(shouldWarn(wall), false);
});

test('유료는 더 올려보낼 곳이 없다', () => {
  assert.equal(nextTier('anon'), 'member');
  assert.equal(nextTier('member'), 'paid');
  assert.equal(nextTier('paid'), null);
});

test('무제한 플랜은 없다 — 모든 티어가 유한하다', () => {
  for (const { limit } of Object.values(QUOTA)) {
    assert.ok(Number.isFinite(limit) && limit > 0);
  }
});
