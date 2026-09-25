export {};

declare const __dirname: string;

/**
 * 검색 필터의 순수 로직. `startDate` 는 web 과 같은 **지금부터 N시간 전**이다.
 * (queryKey 는 filters 로 잡으므로 시각이 들어가도 키가 흔들리지 않는다 —
 * 아래 '키 안정' 테스트가 그 전제를 고정한다.)
 */
const {
  DEFAULT_SEARCH_FILTERS,
  PERIOD_HOURS,
  hasActiveFilters,
  periodStartDate,
} = require('../src/entities/search/model/filters');

describe('기간 → startDate', () => {
  it("'전체 기간'은 startDate 를 아예 보내지 않는다", () => {
    expect(periodStartDate('all')).toBeUndefined();
  });

  it('web 과 같은 롤링 계산 — now - N시간 (자정 절단 아님)', () => {
    // 로컬 시각 00:10 같은 경계에서도 '오늘'은 24시간 전이다(어제 0시가 아니다).
    const now = Date.UTC(2026, 8, 25, 15, 10, 30, 123);
    const HOUR = 60 * 60 * 1000;
    expect(periodStartDate('1d', now)).toBe(
      new Date(now - 24 * HOUR).toISOString(),
    );
    expect(periodStartDate('7d', now)).toBe(
      new Date(now - 7 * 24 * HOUR).toISOString(),
    );
    expect(periodStartDate('30d', now)).toBe(
      new Date(now - 30 * 24 * HOUR).toISOString(),
    );
  });

  it('web PERIOD_HOURS(24·168·720)와 같은 값이다', () => {
    expect(PERIOD_HOURS).toEqual({'1d': 24, '7d': 168, '30d': 720});
  });

  it('★startDate 는 queryKey 에 들어가지 않는다 — 렌더마다 키가 바뀌면 무한 리페치', () => {
    // search.queries 를 require 하면 네이티브 모듈 사슬(async-storage)이 따라와 소스로 본다.
    const fs = require('fs');
    const path = require('path');
    const queries: string = fs.readFileSync(
      path.join(__dirname, '../src/entities/search/api/search.queries.ts'),
      'utf8',
    );
    expect(queries).toContain(
      'products: (keyword: string, filters: SearchFilters) =>',
    );
    expect(queries).toContain('queryKey: this.keys.products(keyword, filters)');
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
