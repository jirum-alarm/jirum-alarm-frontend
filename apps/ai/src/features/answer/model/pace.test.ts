import assert from 'node:assert/strict';
import { test } from 'node:test';

import { settle, STAGE_MIN_MS } from './pace.ts';

test('settle: 빠른 작업도 최소 표시시간을 확보한다', async () => {
  const t0 = Date.now();
  await settle(Date.now(), STAGE_MIN_MS);
  const elapsed = Date.now() - t0;
  assert.ok(elapsed >= STAGE_MIN_MS - 40, `waited only ${elapsed}ms`);
});

test('settle: 이미 오래 걸린 작업엔 추가 지연이 없다 (체감속도 보존)', async () => {
  // 진짜 API 가 느렸던 경우 — 페이싱이 그 위에 지연을 더 얹으면 안 된다
  const longAgo = Date.now() - (STAGE_MIN_MS + 500);
  const t0 = Date.now();
  await settle(longAgo, STAGE_MIN_MS);
  const elapsed = Date.now() - t0;
  assert.ok(elapsed < 50, `should not wait, waited ${elapsed}ms`);
});
