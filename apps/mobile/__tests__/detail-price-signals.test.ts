export {};

/**
 * 상세 가격 신호(게시일 안내·가격 추이 요약)가 web 과 같은 규칙인지.
 * web 원본: features/product-detail/lib/product-seo.ts · ui/PriceHistorySection.tsx.
 * 문구가 어긋나면 같은 상품이 웹/앱에서 달리 보인다. (근거 블록은 서버 dealEvidence 가 정한다.)
 */
const {
  formatDealAgeNotice,
  dealFreshnessAt,
  isSeenBasedFreshness,
} = require('../src/screens/detail/lib/price-signals');
const {
  resolveSubtitle,
  formatRangeLabel,
  pickDefaultDays,
} = require('../src/features/price-history/model/price-summary');

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 8, 25);

describe('formatDealAgeNotice', () => {
  const ago = (days: number) => new Date(NOW - days * DAY).toISOString();

  it('30일 이하·종료 딜·날짜 없음은 안내하지 않는다', () => {
    expect(formatDealAgeNotice(ago(30), false, NOW)).toBeNull();
    expect(formatDealAgeNotice(ago(400), true, NOW)).toBeNull();
    expect(formatDealAgeNotice(null, false, NOW)).toBeNull();
  });

  it('개월·년 단위 문구가 web 과 같다', () => {
    expect(formatDealAgeNotice(ago(45), false, NOW)).toBe(
      '1개월 전에 올라온 핫딜이에요. 가격·재고가 지금과 다를 수 있어요.',
    );
    expect(formatDealAgeNotice(ago(800), false, NOW)).toBe(
      '2년 전에 올라온 핫딜이에요. 가격·재고가 지금과 다를 수 있어요.',
    );
  });
});

describe('resolveSubtitle · formatRangeLabel', () => {
  it('basis 별 부제', () => {
    expect(resolveSubtitle({basis: 'SIMILAR'})).toBe(
      '비슷한 상품 핫딜을 모아 참고용으로 보여드려요',
    );
    expect(resolveSubtitle({basis: 'SELF', confidence: 'HIGH'})).toBe(
      '이 상품의 날짜별 가격을 보여드려요',
    );
    expect(resolveSubtitle({basis: 'MAPPING', confidence: 'HIGH'})).toBe(
      '같은 모델의 커뮤니티 핫딜가를 모아 보여드려요',
    );
    expect(resolveSubtitle({basis: 'MAPPING', confidence: 'LOW'})).toBe(
      '같은 상품의 커뮤니티 핫딜가를 모아 보여드려요',
    );
  });

  it('해가 바뀌면 연도를 붙인다', () => {
    expect(formatRangeLabel('2026-06-01', '2026-09-25')).toBe('06.01 ~ 09.25');
    expect(formatRangeLabel('2025-12-01', '2026-01-25')).toBe(
      '25.12.01 ~ 26.01.25',
    );
  });
});

describe('pickDefaultDays', () => {
  const states = (counts: Record<number, number>) =>
    [30, 90, 180, 365, 730].map(days => ({
      days,
      count: counts[days] ?? 0,
      enabled: (counts[days] ?? 0) >= 2,
    }));

  it('게시 나이를 덮는 가장 짧은 탭을 고른다', () => {
    const s = states({30: 6, 90: 8, 180: 9, 365: 10, 730: 12});
    expect(pickDefaultDays(s, NOW - 150 * DAY, NOW)).toBe(180);
  });

  it('그 탭의 점이 5개 미만이면 더 긴 탭으로 넓힌다', () => {
    const s = states({30: 2, 90: 3, 180: 4, 365: 7});
    expect(pickDefaultDays(s, NOW - 10 * DAY, NOW)).toBe(365);
  });

  it('활성 탭이 없으면 3개월', () => {
    expect(pickDefaultDays(states({}), null, NOW)).toBe(90);
  });
});

describe('dealFreshnessAt (web 과 같은 규칙)', () => {
  it('토스 딜은 마지막 확인 시각 — 매일 재확인되는 딜에 오래됨 안내가 붙지 않게', () => {
    const product = {
      postedAt: '2026-08-10T13:49:03.000Z',
      data: {toss: {lastSeenAt: '2026-10-06T14:00:00.000Z'}},
    };
    expect(dealFreshnessAt(product)).toBe('2026-10-06T14:00:00.000Z');
    expect(isSeenBasedFreshness(product)).toBe(true);
    const now = Date.parse('2026-10-07T00:00:00.000Z');
    expect(
      formatDealAgeNotice(dealFreshnessAt(product), false, now),
    ).toBeNull();
  });

  it('값이 없거나 깨졌으면 게시일 그대로(커뮤니티 딜)', () => {
    expect(dealFreshnessAt({postedAt: '2026-08-10', data: null})).toBe(
      '2026-08-10',
    );
    expect(
      dealFreshnessAt({
        postedAt: '2026-08-10',
        data: {toss: {lastSeenAt: 'x'}},
      }),
    ).toBe('2026-08-10');
    expect(isSeenBasedFreshness({postedAt: '2026-08-10', data: {}})).toBe(
      false,
    );
  });
});
