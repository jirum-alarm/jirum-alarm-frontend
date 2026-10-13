import {
  isPriceAnswerHoldout,
  isPriceAnswerKind,
  PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID,
} from '../src/screens/detail/lib/price-answer-holdout';
import {experimentBucket} from '../src/shared/lib/experiment/experiment-bucket';

jest.mock('@/shared/lib/device/device-id', () => ({getDeviceId: jest.fn()}));

// 기대값은 crawling-server experimentBucket(node crypto)로 계산 — web price-answer-holdout.test.ts 와 같은 표(2026-10-14).
const SERVER_BUCKETS: [string, number][] = [
  ['0192d1a4-7c3e-7000-8000-000000000001', 29],
  ['dd345da7-4944-419c-bce2-8af127b7b436', 39],
  ['a', 84],
  ['device-1', 1],
  ['device-4', 19],
];

describe('price_answer_holdout_v1 — 「답」 숨김 군', () => {
  it('버킷 = 서버 experimentBucket (web 과 같은 값)', () => {
    for (const [id, bucket] of SERVER_BUCKETS) {
      expect(experimentBucket(id, PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID)).toBe(
        bucket,
      );
    }
  });

  it('버킷 20 미만만 숨김 군, 기기 id 가 없으면 대조', () => {
    expect(isPriceAnswerHoldout('device-1')).toBe(true);
    expect(isPriceAnswerHoldout('device-4')).toBe(true);
    expect(isPriceAnswerHoldout('dd345da7-4944-419c-bce2-8af127b7b436')).toBe(
      false,
    );
    expect(isPriceAnswerHoldout(null)).toBe(false);
    expect(isPriceAnswerHoldout('device-1', 0)).toBe(false);
  });

  it('가격 답은 지난 판정·시장가뿐 — 커뮤니티 근거는 숨기지 않는다', () => {
    expect(isPriceAnswerKind('HISTORY')).toBe(true);
    expect(isPriceAnswerKind('MARKET')).toBe(true);
    expect(isPriceAnswerKind('COMMUNITY')).toBe(false);
  });
});
