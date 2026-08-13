export {};

const store: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (k: string) => store[k] ?? null),
  setItem: jest.fn(async (k: string, v: string) => {
    store[k] = v;
  }),
  removeItem: jest.fn(async (k: string) => {
    delete store[k];
  }),
}));

const {
  savePendingAction,
  peekPendingAction,
  takePendingAction,
  PendingActionType,
} = require('../src/shared/lib/pending-action');

describe('로그인 pending action', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-13T12:00:00+09:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('저장한 의도를 꺼내면 지워진다', async () => {
    await savePendingAction(
      PendingActionType.WISHLIST_ADD,
      null,
      '/products/12',
    );
    const taken = await takePendingAction(PendingActionType.WISHLIST_ADD);
    expect(taken?.type).toBe(PendingActionType.WISHLIST_ADD);
    expect(taken?.returnPath).toBe('/products/12');
    expect(await peekPendingAction()).toBeNull();
  });

  it('다른 종류의 take 는 저장을 그대로 둔다', async () => {
    await savePendingAction(PendingActionType.WISHLIST_ADD);
    expect(await takePendingAction(PendingActionType.PRODUCT_LIKE)).toBeNull();
    expect((await peekPendingAction())?.type).toBe(
      PendingActionType.WISHLIST_ADD,
    );
  });

  it('10분이 지나면 버린다', async () => {
    await savePendingAction(PendingActionType.PRODUCT_REPORT);
    jest.setSystemTime(new Date('2026-08-13T12:11:00+09:00'));
    expect(await peekPendingAction()).toBeNull();
  });
});
