import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { formatTossViewCount, getTossTimeDeal, kstLocalNow } =
  require('./toss-time-deal.ts') as typeof import('./toss-time-deal');

// 2026-10-15 13:00 KST
const NOON = Date.UTC(2026, 9, 15, 4, 0, 0);

const toss = (extra: Record<string, unknown> = {}) => ({
  toss: {
    todayDealStartAt: '2026-10-15T00:00:00',
    todayDealEndAt: '2026-10-16T00:00:00',
    dealStatus: 'ON_GOING',
    pageViewCount: 2125,
    ...extra,
  },
});

describe('kstLocalNow', () => {
  it('UTC 를 KST 로컬시각 문자열로', () => {
    assert.equal(kstLocalNow(NOON), '2026-10-15T13:00:00');
  });
});

describe('formatTossViewCount', () => {
  it('1만 미만은 쉼표, 이상은 만 단위 소수 한 자리(내림)', () => {
    assert.equal(formatTossViewCount(2125), '2,125명이 봤어요');
    assert.equal(formatTossViewCount(10_000), '1만명이 봤어요');
    assert.equal(formatTossViewCount(12_999), '1.2만명이 봤어요');
    assert.equal(formatTossViewCount(30_400), '3만명이 봤어요');
  });
});

describe('getTossTimeDeal', () => {
  it('판매 중이면 「선착순특가」·「하루만」·조회수', () => {
    assert.deepEqual(getTossTimeDeal(toss(), NOON), {
      status: 'ON_SALE',
      label: '선착순특가',
      pricePrefix: '하루만',
      viewCountText: '2,125명이 봤어요',
    });
  });

  it('마감 상태는 status 로만 안다(isSoldOut 과 별개)', () => {
    assert.equal(getTossTimeDeal(toss({ dealStatus: 'SOLD_OUT' }), NOON)?.label, '선착순 마감');
    assert.equal(
      getTossTimeDeal(toss({ dealStatus: 'TEMPORARILY_SOLD_OUT' }), NOON)?.label,
      '일시품절',
    );
    assert.equal(getTossTimeDeal(toss({ dealStatus: 'SOLD_OUT' }), NOON)?.pricePrefix, undefined);
  });

  it('창 밖(어제 하루특가)이면 배지 없음', () => {
    const tomorrow = NOON + 24 * 3_600_000;
    assert.equal(getTossTimeDeal(toss(), tomorrow), null);
    // 자정 정각에 끝난다
    assert.equal(getTossTimeDeal(toss(), Date.UTC(2026, 9, 15, 15, 0, 0)), null);
  });

  it('조회 100 미만은 숫자를 안 보인다', () => {
    assert.equal(getTossTimeDeal(toss({ pageViewCount: 42 }), NOON)?.viewCountText, undefined);
  });

  it('토스 하루특가가 아니면 null', () => {
    assert.equal(getTossTimeDeal(null, NOON), null);
    assert.equal(getTossTimeDeal({}, NOON), null);
    assert.equal(getTossTimeDeal({ toss: { section: 'daily' } }, NOON), null);
  });
});
