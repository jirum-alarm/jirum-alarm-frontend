import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { rankingWindowDays, SPARSE_RANKING_CATEGORY_IDS } =
  require('./ranking.ts') as typeof import('./ranking');

test('딜이 드문 카테고리는 60일, 그 밖·전체는 3일', () => {
  for (const id of SPARSE_RANKING_CATEGORY_IDS) assert.equal(rankingWindowDays(id), 60);
  assert.equal(rankingWindowDays(null), 3);
  assert.equal(rankingWindowDays(1), 3);
});
