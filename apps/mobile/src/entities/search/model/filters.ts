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

/** web PERIOD_HOURS(24·168·720)를 일 단위로 옮긴 것. 'all' 은 기간 필터 없음. */
export const PERIOD_DAYS: Record<Exclude<SearchPeriod, 'all'>, number> = {
  '1d': 1,
  '7d': 7,
  '30d': 30,
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
 * 기간 → startDate.
 *
 * ★web 은 `Date.now() - N시간` 으로 **매 렌더 새 값**을 만들고 useMemo 로 막는다.
 * 앱은 자정으로 끊는다 — 시각이 들어가면 queryKey 가 계속 바뀌어 캐시가 죽고
 * 무한 리페치가 된다(querykey-time-granularity-trap). 하루 한 번만 바뀐다.
 *
 * ★N일 전 **자정**이라 web 의 롤링 N일보다 최대 하루 넓다. 좁히는(오늘 자정)
 * 쪽을 고르면 00:10 에 '오늘'을 누른 사람이 10분치만 보게 된다 — 목록이 비어
 * 보이는 쪽이 조금 넓은 쪽보다 나쁘다(발견 탭 startDate 도 같은 규칙).
 */
export function periodStartDate(period: SearchPeriod): string | undefined {
  if (period === 'all') return undefined;
  const d = new Date();
  d.setDate(d.getDate() - PERIOD_DAYS[period]);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
