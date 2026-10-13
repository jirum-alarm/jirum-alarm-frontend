import {
  buildKeywordHubFacts,
  findKeywordHubForQuery,
  formatHubCount,
  pickRecommendedKeywords,
  type KeywordHubSummary,
} from '../src/entities/keyword-hub/lib/keyword-hub';

/** web entities/keyword-hub/lib/keyword-hub.test.ts 와 같은 기대값. */
const hub = (
  extra: Partial<KeywordHubSummary> & {recentDealCount: number},
): KeywordHubSummary => ({
  slug: 'ps5',
  name: 'PS5',
  aliases: ['플스5'],
  countCapped: false,
  activeDays: 0,
  topSources: [],
  ...extra,
});

describe('findKeywordHubForQuery', () => {
  const hubs: KeywordHubSummary[] = [hub({recentDealCount: 10})];

  it('검색어가 키워드 자체일 때만(대소문자·공백·별칭 무시)', () => {
    expect(findKeywordHubForQuery('PS5', hubs)?.slug).toBe('ps5');
    expect(findKeywordHubForQuery('플스 5', hubs)?.slug).toBe('ps5');
  });

  it('더 구체적인 검색어·빈 값은 허브가 아니다', () => {
    expect(findKeywordHubForQuery('ps5 프로', hubs)).toBeUndefined();
    expect(findKeywordHubForQuery('', hubs)).toBeUndefined();
    expect(findKeywordHubForQuery(null, hubs)).toBeUndefined();
  });
});

describe('formatHubCount', () => {
  it('상한에 걸렸으면 +', () => {
    expect(formatHubCount({recentDealCount: 76, countCapped: false})).toBe(
      '76건',
    );
    expect(formatHubCount({recentDealCount: 300, countCapped: true})).toBe(
      '300건+',
    );
  });
});

describe('buildKeywordHubFacts', () => {
  it('「30일 중 M일 · 주로 X N%」', () => {
    expect(
      buildKeywordHubFacts(
        hub({
          recentDealCount: 12,
          activeDays: 9,
          topSources: [{name: '뽐뿌', share: 62}],
        }),
      ),
    ).toEqual(['30일 중 9일', '주로 뽐뿌 62%']);
    expect(buildKeywordHubFacts(hub({recentDealCount: 0}))).toEqual([]);
  });
});

describe('pickRecommendedKeywords', () => {
  it('30일 딜 5건+ 허브에서 n개', () => {
    const picked = pickRecommendedKeywords(
      [
        {name: '삼다수', recentDealCount: 92},
        {name: '에어컨', recentDealCount: 4},
        {name: '햇반', recentDealCount: 120},
      ],
      5,
      () => 0.5,
    );
    expect([...picked].sort()).toEqual(['삼다수', '햇반']);
  });
});
