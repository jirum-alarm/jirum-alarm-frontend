export {};

/**
 * 검색 필터의 순수 로직. 특히 `startDate` 는 **자정으로 끊혀야** 한다 —
 * 시각이 들어가면 queryKey 가 렌더마다 바뀌어 무한 리페치가 된다
 * (querykey-time-granularity-trap). 소스텍스트 검사로는 못 잡는다.
 */
const {
  DEFAULT_SEARCH_FILTERS,
  PERIOD_DAYS,
  hasActiveFilters,
  periodStartDate,
} = require('../src/entities/search/model/filters');

describe('기간 → startDate', () => {
  it("'전체 기간'은 startDate 를 아예 보내지 않는다", () => {
    expect(periodStartDate('all')).toBeUndefined();
  });

  it('자정으로 끊는다 — 같은 날 두 번 불러도 값이 같다(queryKey 안정)', () => {
    const first = periodStartDate('7d');
    const second = periodStartDate('7d');
    expect(first).toBe(second);
    // 로컬 자정이라 시각 성분이 0 이다.
    const d = new Date(first);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
    expect(d.getMilliseconds()).toBe(0);
  });

  it('기간이 길수록 더 과거를 가리킨다', () => {
    const day = periodStartDate('1d');
    const week = periodStartDate('7d');
    const month = periodStartDate('30d');
    expect(new Date(week).getTime()).toBeLessThan(new Date(day).getTime());
    expect(new Date(month).getTime()).toBeLessThan(new Date(week).getTime());
  });

  it('web PERIOD_HOURS(24·168·720)와 같은 길이다', () => {
    expect(PERIOD_DAYS).toEqual({'1d': 1, '7d': 7, '30d': 30});
    // N일 전 자정이므로 오늘 자정보다는 과거, N+1일 전보다는 미래다.
    const midnightToday = new Date();
    midnightToday.setHours(0, 0, 0, 0);
    for (const [period, days] of Object.entries(PERIOD_DAYS)) {
      const value = new Date(periodStartDate(period)).getTime();
      const expected = new Date(midnightToday).setDate(
        midnightToday.getDate() - (days as number),
      );
      expect(value).toBe(expected);
    }
  });
});

describe('필터 활성 판정 (web hasActiveFilters 와 같은 조건)', () => {
  it('기본값은 활성 필터가 없다', () => {
    expect(hasActiveFilters(DEFAULT_SEARCH_FILTERS)).toBe(false);
  });

  it('정렬만 바꾼 것은 "필터 적용"이 아니다 — 초기화 버튼이 뜨면 안 된다', () => {
    expect(
      hasActiveFilters({...DEFAULT_SEARCH_FILTERS, sort: 'relevance'}),
    ).toBe(false);
  });

  it('카테고리·출처·기간·품절포함은 활성으로 센다', () => {
    expect(
      hasActiveFilters({...DEFAULT_SEARCH_FILTERS, categoryIds: [1]}),
    ).toBe(true);
    expect(
      hasActiveFilters({...DEFAULT_SEARCH_FILTERS, providerIds: [2]}),
    ).toBe(true);
    expect(hasActiveFilters({...DEFAULT_SEARCH_FILTERS, period: '7d'})).toBe(
      true,
    );
    expect(hasActiveFilters({...DEFAULT_SEARCH_FILTERS, ended: true})).toBe(
      true,
    );
  });
});
