import assert from 'node:assert/strict';
import { test } from 'node:test';

import { QUOTA } from './quota.ts';

/**
 * 서버 티어가 저장된 티어를 이기는지 검증한다.
 *
 * quotaStore 는 localStorage 를 직접 만지므로 여기서 최소 스텁을 깐다 —
 * 이 규칙이 깨지면 로그인 유저가 익명 카운터를 물려받거나(3회로 줄어듦),
 * 반대로 로그아웃이 한도 우회로가 된다.
 */

const store = new Map<string, string>();
(globalThis as unknown as { window: unknown }).window = {};
(globalThis as unknown as { localStorage: unknown }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};

const { readQuota, spendQuota, resetQuota } = await import('./quotaStore.ts');

test('서버 티어가 저장된 티어를 이긴다', () => {
  store.clear();
  spendQuota('anon'); // 익명으로 1회 소비
  // 로그인하면 서버가 member 를 준다 — 저장된 anon 을 따라가면 안 된다
  assert.equal(readQuota('member').tier, 'member');
});

test('티어가 바뀌면 카운터를 리셋한다 — 익명 사용분이 로그인 한도를 깎지 않는다', () => {
  store.clear();
  spendQuota('anon');
  spendQuota('anon');
  spendQuota('anon'); // 익명 3회 = 소진

  const afterLogin = readQuota('member');
  assert.equal(afterLogin.used, 0, '로그인 직후엔 카운터가 0이어야 한다');
  assert.equal(afterLogin.tier, 'member');
});

test('같은 티어면 카운터를 이어받는다 — 새로고침이 한도를 되돌리지 않는다', () => {
  store.clear();
  spendQuota('member');
  spendQuota('member');
  assert.equal(readQuota('member').used, 2);
});

test('서버 티어가 없으면 저장값을 쓴다 — 홈 목업 바 경로', () => {
  store.clear();
  spendQuota('paid');
  assert.equal(readQuota().tier, 'paid');
});

test('초기화하면 익명 0회로 돌아간다', () => {
  store.clear();
  spendQuota('member');
  const after = resetQuota();
  assert.equal(after.tier, 'anon');
  assert.equal(after.used, 0);
});

test('소비는 한도를 넘어서도 기록된다 — remaining 이 음수를 막는다', () => {
  store.clear();
  for (let i = 0; i < QUOTA.anon.limit + 2; i++) spendQuota('anon');
  assert.ok(readQuota('anon').used > QUOTA.anon.limit);
});
