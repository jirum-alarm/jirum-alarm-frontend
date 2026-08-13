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
  pushRecentViewedProduct,
  getRecentViewedProducts,
  buildRecentViewedInjectScript,
  WEB_RECENT_VIEWED_KEY,
} = require('../src/shared/lib/device/recent-viewed');

const item = (id: number) => ({
  id,
  title: `상품 ${id}`,
  thumbnail: null,
  price: '1,000원',
});

describe('최근 본 상품 — 웹뷰 홈이 읽던 목록을 네이티브가 대신 쌓는다', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
  });

  it('최신이 앞에 온다', async () => {
    await pushRecentViewedProduct(item(1));
    await pushRecentViewedProduct(item(2));
    expect((await getRecentViewedProducts()).map((p: any) => p.id)).toEqual([
      2, 1,
    ]);
  });

  it('같은 상품을 다시 보면 맨 앞으로 올라가고 중복되지 않는다', async () => {
    await pushRecentViewedProduct(item(1));
    await pushRecentViewedProduct(item(2));
    await pushRecentViewedProduct(item(1));
    expect((await getRecentViewedProducts()).map((p: any) => p.id)).toEqual([
      1, 2,
    ]);
  });

  it('20건을 넘으면 오래된 것부터 버린다', async () => {
    for (let i = 1; i <= 25; i++) await pushRecentViewedProduct(item(i));
    const list = await getRecentViewedProducts();
    expect(list).toHaveLength(20);
    expect(list[0].id).toBe(25);
    expect(list.at(-1).id).toBe(6);
  });

  // 저장 포맷이 바뀌거나 값이 손상돼도 상세 화면이 죽으면 안 된다.
  it('손상된 저장값은 빈 배열로 처리한다', async () => {
    store.recentViewedProducts = '{ not json';
    expect(await getRecentViewedProducts()).toEqual([]);
    store.recentViewedProducts = '{"a":1}';
    expect(await getRecentViewedProducts()).toEqual([]);
  });

  it('웹뷰 주입 스크립트는 web localStorage 키를 쓴다', () => {
    const script = buildRecentViewedInjectScript([item(1), item(2)]);
    expect(script).toContain(WEB_RECENT_VIEWED_KEY);
    expect(script).toContain('localStorage.setItem');
    expect(script).toMatch(/\\"id\\":1/);
  });

  it('웹뷰에는 5건만 심는다(web 상한)', () => {
    const many = Array.from({length: 8}, (_, i) => item(i + 1));
    const script = buildRecentViewedInjectScript(many);
    expect(script).toMatch(/\\"id\\":5/);
    expect(script).not.toMatch(/\\"id\\":6/);
  });
});
