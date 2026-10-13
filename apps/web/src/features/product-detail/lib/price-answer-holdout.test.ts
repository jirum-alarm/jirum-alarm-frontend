import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { answerHoldoutBucket, PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID, PRICE_ANSWER_HOLDOUT_SCRIPT } =
  require('./price-answer-holdout.ts') as typeof import('./price-answer-holdout');

// 기대값은 crawling-server src/experiment/experiment-bucket.ts(node crypto sha256)로 계산했다(2026-10-14).
const SERVER_BUCKETS: [string, number][] = [
  ['0192d1a4-7c3e-7000-8000-000000000001', 29],
  ['dd345da7-4944-419c-bce2-8af127b7b436', 39],
  ['4cc3c784-77a1-4f72-a9ab-5f795abcda9e', 42],
  ['a', 84],
  ['기기', 34],
  ['device-1', 1],
  ['device-4', 19],
];

test('버킷은 서버 experimentBucket 과 같은 값이다', () => {
  for (const [id, bucket] of SERVER_BUCKETS) {
    assert.equal(answerHoldoutBucket(id, PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID), bucket, id);
  }
});

/** 인라인 스크립트를 그대로 돌린다 — 문자열로 들어가도 바깥 식별자 없이 도는지. */
function runScript(deviceId: string | null): string | null {
  const attrs = new Map<string, string>();
  const env = {
    localStorage: { getItem: () => deviceId },
    document: { documentElement: { setAttribute: (k: string, v: string) => attrs.set(k, v) } },
  };
  new Function('localStorage', 'document', PRICE_ANSWER_HOLDOUT_SCRIPT)(
    env.localStorage,
    env.document,
  );
  return attrs.get('data-answer-holdout') ?? null;
}

test('인라인 스크립트 — 숨김 버킷(<20) 기기만 표식을 단다', () => {
  assert.equal(runScript('device-1'), '1');
  assert.equal(runScript('device-4'), '1');
  assert.equal(runScript('dd345da7-4944-419c-bce2-8af127b7b436'), null);
});

test('인라인 스크립트 — 기기 id 가 없으면(첫 방문) 대조', () => {
  assert.equal(runScript(null), null);
});
