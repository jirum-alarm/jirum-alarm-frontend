export {};

/**
 * 최근 검색어 — 쓰기 흐름은 소스텍스트 검사로 못 잡는다(저장이 실제로 되는지가
 * 관심사다). 순수 함수 + 저장소를 실제로 돌린다.
 *
 * web 정본: widgets/search/hooks/useSearchInputViewModel.ts 의 `setRecentKeyord`
 * (localStorage 'gr-recent-keywords') + RecentKeywords 의 삭제.
 */

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
  addRecentKeyword,
  removeRecentKeyword,
  loadRecentKeywords,
  saveRecentKeywords,
  RECENT_KEYWORDS_LIMIT,
} = require('../src/features/search/lib/recent-keywords');

describe('최근 검색어 목록 규칙 (web setRecentKeyord 와 동일)', () => {
  it('새 검색어가 맨 앞에 온다', () => {
    expect(addRecentKeyword(['라면'], '모니터')).toEqual(['모니터', '라면']);
  });

  it('이미 있는 검색어는 중복되지 않고 맨 앞으로 올라간다', () => {
    expect(addRecentKeyword(['라면', '모니터', '쌀'], '모니터')).toEqual([
      '모니터',
      '라면',
      '쌀',
    ]);
  });

  it('10개를 넘으면 오래된 것부터 버린다', () => {
    let list: string[] = [];
    for (let i = 1; i <= 13; i++) list = addRecentKeyword(list, `키워드${i}`);
    expect(RECENT_KEYWORDS_LIMIT).toBe(10);
    expect(list).toHaveLength(10);
    expect(list[0]).toBe('키워드13');
    expect(list.at(-1)).toBe('키워드4');
  });

  it('공백만 있는 검색어는 저장하지 않는다', () => {
    expect(addRecentKeyword(['라면'], '   ')).toEqual(['라면']);
    expect(addRecentKeyword(['라면'], '')).toEqual(['라면']);
  });

  it('앞뒤 공백은 잘라서 저장한다 — 같은 말이 두 벌 남지 않게', () => {
    expect(addRecentKeyword([], '  모니터 ')).toEqual(['모니터']);
    expect(addRecentKeyword(['모니터'], ' 모니터')).toEqual(['모니터']);
  });

  it('삭제는 그 검색어만 지운다', () => {
    expect(removeRecentKeyword(['라면', '모니터'], '라면')).toEqual(['모니터']);
  });
});

describe('저장소 왕복', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
  });

  it('저장한 목록을 그대로 읽는다', async () => {
    await saveRecentKeywords(['모니터', '라면']);
    expect(await loadRecentKeywords()).toEqual(['모니터', '라면']);
  });

  it('전체 삭제하면 저장값이 사라진다(키까지 지운다)', async () => {
    await saveRecentKeywords(['모니터']);
    await saveRecentKeywords([]);
    expect(await loadRecentKeywords()).toEqual([]);
    expect(Object.keys(store)).toHaveLength(0);
  });

  it('아무것도 저장하지 않았으면 빈 목록이다', async () => {
    expect(await loadRecentKeywords()).toEqual([]);
  });

  it('저장값이 손상돼도 검색 화면이 죽지 않는다', async () => {
    // 예전 포맷(문자열)·깨진 JSON 이 들어와도 빈 목록으로 흡수한다.
    store.recentSearchKeywords = '"모니터"';
    expect(await loadRecentKeywords()).toEqual([]);
    store.recentSearchKeywords = '{oops';
    expect(await loadRecentKeywords()).toEqual([]);
  });

  it('문자열이 아닌 원소는 걸러낸다', async () => {
    store.recentSearchKeywords = JSON.stringify(['모니터', 3, null, '라면']);
    expect(await loadRecentKeywords()).toEqual(['모니터', '라면']);
  });
});
