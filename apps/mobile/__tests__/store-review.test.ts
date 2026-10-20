export {};

/**
 * 스토어 평점 요청 규칙(store-review). 네이티브 모듈(expo-store-review)은 다음 네이티브 묶음에 들어가므로
 * 지금 바이너리에선 null — 그때도 아무것도 안 하고 안 죽어야 한다. 있을 땐 «여러 날 쓴 사람이 이번 실행에서
 * 딜을 둘 이상 보고 홈에 왔을 때, 120일에 한 번»만 OS 시트를 부른다.
 */
type StoreReviewModule = typeof import('../src/shared/lib/store-review');
type NativeReview = {
  isAvailableAsync: jest.Mock<Promise<boolean>, []>;
  requestReview: jest.Mock<Promise<void>, []>;
};

const mockStore: Record<string, string> = {};
const mockTrack = jest.fn();
let mockNative: NativeReview | null = null;

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (k: string) => mockStore[k] ?? null),
  setItem: jest.fn(async (k: string, v: string) => {
    mockStore[k] = v;
  }),
  removeItem: jest.fn(async (k: string) => {
    delete mockStore[k];
  }),
}));
jest.mock('expo', () => ({requireOptionalNativeModule: () => mockNative}));
jest.mock('../src/shared/lib/analytics/ga4', () => ({
  Analytics: {track: (...args: unknown[]) => mockTrack(...args)},
}));

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 21, 3, 0); // KST 12:00

const load = (withNative: NativeReview | null): StoreReviewModule => {
  mockNative = withNative;
  let mod: StoreReviewModule | undefined;
  jest.isolateModules(() => {
    mod = require('../src/shared/lib/store-review');
  });
  return mod!;
};

const makeNative = (): NativeReview => ({
  isAvailableAsync: jest.fn(async () => true),
  requestReview: jest.fn(async () => {}),
});

const seedDays = (n: number) => {
  const days = Array.from({length: n}, (_, i) =>
    new Date(NOW - (i + 1) * DAY + 9 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
  );
  mockStore.reviewActiveDays = JSON.stringify(days);
};

beforeEach(() => {
  for (const k of Object.keys(mockStore)) delete mockStore[k];
  mockTrack.mockClear();
});

describe('규칙(순수 함수)', () => {
  const m = load(null);

  it('KST 날짜 — UTC 15시부터 다음 날', () => {
    expect(m.kstDay(Date.UTC(2026, 9, 21, 14, 59))).toBe('2026-10-21');
    expect(m.kstDay(Date.UTC(2026, 9, 21, 15, 0))).toBe('2026-10-22');
  });

  it('쓴 날은 중복 없이 최근 30개만', () => {
    const days = ['2026-10-01'];
    expect(m.addActiveDay(days, '2026-10-01')).toBe(days);
    const many = Array.from(
      {length: 30},
      (_, i) => `2026-09-${String(i + 1).padStart(2, '0')}`,
    );
    const next = m.addActiveDay(many, '2026-10-21');
    expect(next).toHaveLength(30);
    expect(next[29]).toBe('2026-10-21');
    expect(next[0]).toBe('2026-09-02');
  });

  it('여러 날 썼고·이번 실행에서 딜을 둘 이상 봤고·120일 지났을 때만', () => {
    const ok = {
      activeDays: 5,
      dealsThisSession: 2,
      lastRequestedAt: null,
      now: NOW,
    };
    expect(m.shouldRequestReview(ok)).toBe(true);
    expect(m.shouldRequestReview({...ok, activeDays: 4})).toBe(false);
    expect(m.shouldRequestReview({...ok, dealsThisSession: 1})).toBe(false);
    expect(
      m.shouldRequestReview({...ok, lastRequestedAt: NOW - 119 * DAY}),
    ).toBe(false);
    expect(
      m.shouldRequestReview({...ok, lastRequestedAt: NOW - 120 * DAY}),
    ).toBe(true);
  });
});

describe('쓴 날 기록', () => {
  it('하루 한 번만 더한다', async () => {
    const m = load(null);
    await m.recordActiveDay(NOW);
    await m.recordActiveDay(NOW + 60 * 1000);
    expect(JSON.parse(mockStore.reviewActiveDays)).toEqual(['2026-10-21']);
    await m.recordActiveDay(NOW + DAY);
    expect(JSON.parse(mockStore.reviewActiveDays)).toEqual([
      '2026-10-21',
      '2026-10-22',
    ]);
  });
});

describe('평점 요청', () => {
  it('네이티브 모듈이 없는 바이너리(지금)에선 조건이 맞아도 아무것도 안 한다', async () => {
    const m = load(null);
    seedDays(10);
    m.noteDealViewed();
    m.noteDealViewed();
    expect(await m.maybeRequestReview(NOW)).toBe(false);
    expect(mockStore.reviewRequestedAt).toBeUndefined();
    expect(mockTrack).not.toHaveBeenCalled();
  });

  it('조건이 맞으면 한 번 부르고 시각을 먼저 남긴다 — 다음엔 120일 쉰다', async () => {
    const nativeReview = makeNative();
    const m = load(nativeReview);
    seedDays(5);
    m.noteDealViewed();
    expect(await m.maybeRequestReview(NOW)).toBe(false); // 이번 실행 딜 1개
    m.noteDealViewed();
    expect(await m.maybeRequestReview(NOW)).toBe(true);
    expect(nativeReview.requestReview).toHaveBeenCalledTimes(1);
    expect(JSON.parse(mockStore.reviewRequestedAt)).toBe(NOW);
    expect(mockTrack).toHaveBeenCalledWith('store_review_request', {
      active_days: 5,
    });

    expect(await m.maybeRequestReview(NOW + DAY)).toBe(false);
    expect(nativeReview.requestReview).toHaveBeenCalledTimes(1);
  });

  it('시스템이 못 띄우는 환경(TestFlight 등)이면 기록도 안 남긴다', async () => {
    const nativeReview = makeNative();
    nativeReview.isAvailableAsync.mockResolvedValue(false);
    const m = load(nativeReview);
    seedDays(8);
    m.noteDealViewed();
    m.noteDealViewed();
    expect(await m.maybeRequestReview(NOW)).toBe(false);
    expect(mockStore.reviewRequestedAt).toBeUndefined();
  });
});
