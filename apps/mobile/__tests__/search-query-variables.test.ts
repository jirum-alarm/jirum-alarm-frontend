/**
 * 검색이 서버에 **실제로 보내는** 변수 — web 목록과 같은 정본(@jirum/domain/search searchFilterVariables·endedRescueVariables)
 * 을 쓰는지 소스 문자열이 아니라 보낸 값으로 본다(SearchService 를 가로챈다).
 */
export {};

jest.mock('@/shared/api/search', () => ({
  SearchService: {
    getProducts: jest.fn(async () => []),
    getSuggestions: jest.fn(async () => []),
  },
}));

type GetProducts = jest.Mock<Promise<unknown[]>, [Record<string, unknown>]>;

const {SearchService} = require('@/shared/api/search') as {
  SearchService: {getProducts: GetProducts};
};
const {SearchQueries} = require('../src/entities/search/api/search.queries');

type Filters = {
  categoryIds: number[];
  providerIds: number[];
  period: 'all' | '1d' | '7d' | '30d';
  ended: boolean;
  sort: 'recent' | 'comments' | 'relevance';
};

const base: Filters = {
  categoryIds: [],
  providerIds: [],
  period: 'all',
  ended: false,
  sort: 'recent',
};

const sent = async (keyword: string, filters: Filters) => {
  SearchService.getProducts.mockClear();
  await SearchQueries.products(keyword, filters).queryFn({pageParam: null});
  return SearchService.getProducts.mock.calls[0][0];
};

describe('검색 목록 쿼리 변수', () => {
  it('기본 — 빈 칩·최신순·품절 제외는 안 보낸다', async () => {
    expect(await sent('물티슈', base)).toEqual({
      limit: 20,
      searchAfter: null,
      keyword: '물티슈',
      categoryIds: undefined,
      providerIds: undefined,
      startDate: undefined,
      isEnd: undefined,
      orderBy: undefined,
    });
  });

  it('칩·품절 포함·정렬을 켜면 그 값을 보낸다(정렬은 서버 enum 값)', async () => {
    const v = await sent('물티슈', {
      ...base,
      categoryIds: [2],
      providerIds: [5, 7],
      ended: true,
      sort: 'comments',
    });
    expect(v).toMatchObject({
      categoryIds: [2],
      providerIds: [5, 7],
      isEnd: true,
      orderBy: 'COMMENT_COUNT',
    });
    expect((await sent('물티슈', {...base, sort: 'relevance'})).orderBy).toBe(
      'RELEVANCE',
    );
  });

  it('기간은 지금부터 N시간 전(ISO)', async () => {
    const v = await sent('물티슈', {...base, period: '1d'});
    const hours =
      (Date.now() - Date.parse(v.startDate as string)) / (3600 * 1000);
    expect(hours).toBeGreaterThan(23.9);
    expect(hours).toBeLessThan(24.1);
  });
});

describe('진짜 0건일 때 종료 포함으로 다시 세기', () => {
  it('목록과 같은 쪽 크기(20)로 isEnd: true — limit 1 은 첫 행이 걸러지면 0건으로 오판했다', async () => {
    SearchService.getProducts.mockClear();
    await SearchQueries.endedCount('물티슈').queryFn();
    expect(SearchService.getProducts.mock.calls[0][0]).toEqual({
      limit: 20,
      keyword: '물티슈',
      isEnd: true,
    });
  });
});
