import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { answerHoldoutBucket } =
  require('./price-answer-holdout.ts') as typeof import('./price-answer-holdout');
const { BEAUTY_CATEGORY_ID, BEAUTY_ROOM_EXPERIMENT_ID, beautyRoomArmForBucket, beautyRoomExpTag } =
  require('./beauty-room-experiment.ts') as typeof import('./beauty-room-experiment');

/** crawling-server src/experiment/experiment-bucket.ts 와 같은 계산(node crypto sha256 앞 4바이트 % 100). */
const serverBucket = (unitId: string, experimentId: string) =>
  createHash('sha256').update(`${experimentId}:${unitId}`).digest().readUInt32BE(0) % 100;

// 앱 __tests__/beauty-room-experiment.test.ts 와 같은 표 — 두 플랫폼이 같은 기기를 같은 군에 넣는지.
const BUCKETS: [string, number][] = [
  ['device-1', 75],
  ['device-4', 38],
  ['device-6', 8],
  ['dd345da7-4944-419c-bce2-8af127b7b436', 99],
  ['0192d1a4-7c3e-7000-8000-000000000001', 42],
  ['기기', 69],
];

test('버킷은 서버 experimentBucket 과 같은 값이다', () => {
  for (const [id, bucket] of BUCKETS) {
    assert.equal(serverBucket(id, BEAUTY_ROOM_EXPERIMENT_ID), bucket, `server ${id}`);
    assert.equal(answerHoldoutBucket(id, BEAUTY_ROOM_EXPERIMENT_ID), bucket, id);
  }
});

test('화장품 상세만 배정 — 비율을 주면 버킷 < 비율이 b(뷰티방), 나머지 a', () => {
  assert.equal(beautyRoomArmForBucket(10, BEAUTY_CATEGORY_ID, 50), 'b');
  assert.equal(beautyRoomArmForBucket(49, BEAUTY_CATEGORY_ID, 50), 'b');
  assert.equal(beautyRoomArmForBucket(50, BEAUTY_CATEGORY_ID, 50), 'a');
  assert.equal(beautyRoomArmForBucket(10, 1), null);
  assert.equal(beautyRoomArmForBucket(10, undefined), null);
});

test('기본값(전면 적용 100) — 화장품 상세는 버킷과 무관하게 전부 b', () => {
  assert.equal(beautyRoomArmForBucket(0, BEAUTY_CATEGORY_ID), 'b');
  assert.equal(beautyRoomArmForBucket(99, BEAUTY_CATEGORY_ID), 'b');
});

test('기기 id 가 없거나(버킷 없음) 실험을 끄면 대상이 아니다', () => {
  assert.equal(beautyRoomArmForBucket(null, BEAUTY_CATEGORY_ID), null);
  assert.equal(beautyRoomArmForBucket(10, BEAUTY_CATEGORY_ID, 0), null);
});

test('exp 표식은 `<실험id>:<군>`', () => {
  assert.equal(beautyRoomExpTag('b'), 'beauty_detail_room_v1:b');
  assert.equal(beautyRoomExpTag('a'), 'beauty_detail_room_v1:a');
});
