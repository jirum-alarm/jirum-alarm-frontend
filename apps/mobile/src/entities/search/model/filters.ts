/**
 * 검색 필터 모델. web 정본: widgets/search/hooks/useSearchFilters.ts
 *
 * ★web 은 nuqs 로 **URL 쿼리스트링**을 정본으로 쓴다(공유·뒤로가기에 필터가
 * 남는다). 앱엔 URL 이 없고 검색 화면이 스택 루트라 화면 state 가 정본이다 —
 * 검색에서 상세로 들어갔다 나오면 화면이 살아 있어 필터가 그대로 남는다.
 */

export const SEARCH_SORTS = ['recent', 'comments', 'relevance'] as const;
export type SearchSort = (typeof SEARCH_SORTS)[number];

export const SEARCH_PERIODS = ['all', '1d', '7d', '30d'] as const;
export type SearchPeriod = (typeof SEARCH_PERIODS)[number];

export const SORT_LABELS: Record<SearchSort, string> = {
  recent: '최신순',
  comments: '댓글 많은 순',
  relevance: '정확도순',
};

export const PERIOD_LABELS: Record<SearchPeriod, string> = {
  all: '전체 기간',
  '1d': '오늘',
  '7d': '이번주',
  '30d': '한달',
};

/** web PERIOD_HOURS 와 같은 값. 'all' 은 기간 필터 없음. */
export const PERIOD_HOURS: Record<Exclude<SearchPeriod, 'all'>, number> = {
  '1d': 24,
  '7d': 24 * 7,
  '30d': 24 * 30,
};

export type SearchFilters = {
  categoryIds: number[];
  providerIds: number[];
  sort: SearchSort;
  period: SearchPeriod;
  /** 품절(종료) 포함. web `ended` — 켜면 isEnd: true 로 '종료 포함'을 요청한다. */
  ended: boolean;
};

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  categoryIds: [],
  providerIds: [],
  sort: 'recent',
  period: 'all',
  ended: false,
};

/** 초기화 버튼을 보일지. web 과 같은 조건 — 정렬은 '적용된 필터'로 세지 않는다. */
export function hasActiveFilters(filters: SearchFilters): boolean {
  return (
    filters.categoryIds.length > 0 ||
    filters.providerIds.length > 0 ||
    filters.ended ||
    filters.period !== 'all'
  );
}

/**
 * 기간 → startDate. web 과 같은 계산 — **지금부터 N시간 전**(롤링).
 *
 * ★예전엔 "N일 전 자정"으로 끊었다(queryKey 에 시각이 들어가면 캐시가 죽는다는
 * 이유). 그런데 startDate 는 queryKey 에 **들어가지 않는다** — 키는
 * `(keyword, filters)` 이고 startDate 는 queryFn 클로저가 조회 시점에 읽는다.
 * 그래서 롤링으로 바꿔도 키는 그대로이고, 자정 절단은 web 보다 최대 하루 넓은
 * 결과만 남겼다('오늘' 을 누르면 어제 0시부터가 나왔다).
 * ⚠️startDate 를 queryKey 에 넣지 말 것 — 그 순간 렌더마다 키가 바뀐다.
 */
export function periodStartDate(
  period: SearchPeriod,
  now: number = Date.now(),
): string | undefined {
  if (period === 'all') return undefined;
  return new Date(now - PERIOD_HOURS[period] * 60 * 60 * 1000).toISOString();
}
