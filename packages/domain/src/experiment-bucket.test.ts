import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { experimentBucket } = require('./experiment-bucket.ts') as typeof import('./experiment-bucket');
const { BEAUTY_CATEGORY_ID, BEAUTY_ROOM_EXPERIMENT_ID, beautyRoomArmForBucket, beautyRoomExpTag } =
  require('./beauty-room-experiment.ts') as typeof import('./beauty-room-experiment');
const { PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID, isPriceAnswerHoldoutBucket, isPriceAnswerKind } =
  require('./price-answer-holdout.ts') as typeof import('./price-answer-holdout');

/** crawling-server src/experiment/experiment-bucket.ts 와 같은 계산(node crypto sha256 앞 4바이트 % 100). */
const serverBucket = (unitId: string, experimentId: string) =>
  createHash('sha256').update(`${experimentId}:${unitId}`).digest().readUInt32BE(0) % 100;

const IDS = [
  '',
  'a',
  'device-1',
  'device-4',
  'device-6',
  '기기',
  '가나다-기기',
  '😀-emoji',
  '0192d1a4-7c3e-7000-8000-000000000001',
  'dd345da7-4944-419c-bce2-8af127b7b436',
  'x'.repeat(200), // 여러 블록
];
const EXPERIMENTS = [
  BEAUTY_ROOM_EXPERIMENT_ID,
  PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID,
  'first_visit_sheet_holdout_v1',
  'app_purchase_webview_v1',
];

describe('experimentBucket — 서버·web·앱이 같은 기기를 같은 군에', () => {
  it('서버(node crypto sha256)와 같은 값', () => {
    for (const exp of EXPERIMENTS)
      for (const id of IDS) assert.equal(experimentBucket(id, exp), serverBucket(id, exp), `${exp}:${id}`);
  });

  it('web·앱 테스트에 박혀 있던 고정 표(2026-10-13~14 서버 계산)', () => {
    assert.equal(experimentBucket('device-1', BEAUTY_ROOM_EXPERIMENT_ID), 75);
    assert.equal(experimentBucket('device-6', BEAUTY_ROOM_EXPERIMENT_ID), 8);
    assert.equal(experimentBucket('기기', BEAUTY_ROOM_EXPERIMENT_ID), 69);
    assert.equal(experimentBucket('device-1', PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID), 1);
    assert.equal(experimentBucket('a', PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID), 84);
    assert.equal(experimentBucket('가나다-기기', 'app_purchase_webview_v1'), 59);
  });

  it('toString 해서 인라인 스크립트로 돌려도 같은 값(web 첫 페인트 스크립트)', () => {
    const inlined = new Function(`return ${experimentBucket.toString()}`)() as typeof experimentBucket;
    for (const id of IDS)
      assert.equal(inlined(id, PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID), serverBucket(id, PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID));
  });
});

describe('beautyRoomArmForBucket', () => {
  it('화장품만, 버킷 < 비율이 b', () => {
    assert.equal(beautyRoomArmForBucket(49, BEAUTY_CATEGORY_ID, 50), 'b');
    assert.equal(beautyRoomArmForBucket(50, BEAUTY_CATEGORY_ID, 50), 'a');
    assert.equal(beautyRoomArmForBucket(10, 1), null);
    assert.equal(beautyRoomArmForBucket(null, BEAUTY_CATEGORY_ID), null);
    assert.equal(beautyRoomArmForBucket(10, BEAUTY_CATEGORY_ID, 0), null);
    assert.equal(beautyRoomArmForBucket(99, BEAUTY_CATEGORY_ID), 'b'); // 전면 적용 100
    assert.equal(beautyRoomExpTag('a'), 'beauty_detail_room_v1:a');
  });
});

describe('price_answer_holdout', () => {
  it('버킷 < 20 만 숨김, 버킷 없으면 대조', () => {
    assert.equal(isPriceAnswerHoldoutBucket(19), true);
    assert.equal(isPriceAnswerHoldoutBucket(20), false);
    assert.equal(isPriceAnswerHoldoutBucket(null), false);
    assert.equal(isPriceAnswerHoldoutBucket(1, 0), false);
    assert.equal(isPriceAnswerKind('MARKET'), true);
    assert.equal(isPriceAnswerKind('COMMUNITY'), false);
  });
});
