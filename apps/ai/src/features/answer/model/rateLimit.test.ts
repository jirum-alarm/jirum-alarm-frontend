import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkRate, clientIp, RATE_LIMIT, resetRate } from './rateLimit.ts';

test('checkRate: 한도까지 통과하고 넘으면 막는다', () => {
  resetRate();
  const t = 1_000_000;
  for (let i = 0; i < RATE_LIMIT.MAX_PER_WINDOW; i++) {
    assert.equal(checkRate('1.1.1.1', t).ok, true, `req ${i + 1} should pass`);
  }
  const over = checkRate('1.1.1.1', t);
  assert.equal(over.ok, false);
  if (!over.ok) assert.ok(over.retryAfterSec >= 1);
});

test('checkRate: 윈도가 지나면 다시 통과한다', () => {
  resetRate();
  const t = 2_000_000;
  for (let i = 0; i < RATE_LIMIT.MAX_PER_WINDOW; i++) checkRate('2.2.2.2', t);
  assert.equal(checkRate('2.2.2.2', t).ok, false);
  assert.equal(checkRate('2.2.2.2', t + RATE_LIMIT.WINDOW_MS + 1).ok, true);
});

test('checkRate: IP 별로 독립 카운트 (한 명이 남을 막지 않는다)', () => {
  resetRate();
  const t = 3_000_000;
  for (let i = 0; i < RATE_LIMIT.MAX_PER_WINDOW; i++) checkRate('3.3.3.3', t);
  assert.equal(checkRate('3.3.3.3', t).ok, false);
  assert.equal(checkRate('4.4.4.4', t).ok, true);
});

test('clientIp: x-forwarded-for 첫 항목을 쓴다', () => {
  const req = new Request('http://x', { headers: { 'x-forwarded-for': '9.9.9.9, 10.0.0.1' } });
  assert.equal(clientIp(req), '9.9.9.9');
  assert.equal(clientIp(new Request('http://x')), 'unknown');
});
