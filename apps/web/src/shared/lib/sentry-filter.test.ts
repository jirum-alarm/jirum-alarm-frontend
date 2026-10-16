import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import type { ErrorEvent } from '@sentry/nextjs';

const require = createRequire(import.meta.url);
const { createBurstLimiter } = require('./sentry-filter.ts') as typeof import('./sentry-filter');

const errorEvent = (value: string): ErrorEvent =>
  ({ type: undefined, exception: { values: [{ type: 'FetchError', value }] } }) as ErrorEvent;

test('같은 에러는 10분 안에 3건까지만 통과한다', () => {
  const t = 0;
  const limit = createBurstLimiter(() => t);
  const results = Array.from({ length: 5 }, () => limit(errorEvent('ECONNREFUSED')));
  assert.equal(results.filter(Boolean).length, 3);
});

test('다른 에러는 따로 센다', () => {
  const limit = createBurstLimiter(() => 0);
  for (let i = 0; i < 3; i += 1) limit(errorEvent('a'));
  assert.ok(limit(errorEvent('b')));
});

test('10분이 지나면 다시 보낸다', () => {
  let t = 0;
  const limit = createBurstLimiter(() => t);
  for (let i = 0; i < 4; i += 1) limit(errorEvent('a'));
  assert.equal(limit(errorEvent('a')), null);
  t = 10 * 60 * 1000 + 1;
  assert.ok(limit(errorEvent('a')));
});
