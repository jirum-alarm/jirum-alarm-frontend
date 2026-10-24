/**
 * 검색 필터 모델. web 정본: widgets/search/hooks/useSearchFilters.ts
 *
 * ★web 은 nuqs 로 **URL 쿼리스트링**을 정본으로 쓴다(공유·뒤로가기에 필터가
 * 남는다). 앱엔 URL 이 없고 검색 화면이 스택 루트라 화면 state 가 정본이다 —
 * 검색에서 상세로 들어갔다 나오면 화면이 살아 있어 필터가 그대로 남는다.
 */

import type {SearchPeriod, SearchSort} from '@jirum/domain/search';

// 필터 후보·라벨·기간 계산·초기화 조건은 web 과 같은 @jirum/domain/search 정본.
export {
  hasActiveSearchFilters as hasActiveFilters,
  PERIOD_HOURS,
  PERIOD_LABELS,
  periodStartDate,
  SEARCH_PERIODS,
  SEARCH_SORTS,
  SORT_LABELS,
  type SearchPeriod,
  type SearchSort,
} from '@jirum/domain/search';

export type SearchFilters = {
  categoryIds: number[];
  providerIds: number[];
  sort: SearchSort;
  period: SearchPeriod;
  /** 품절(종료) 포함. web `ended` — 켜면 isEnd: true 로 '종료 포함'을 요청한다. */
  ended: boolean;
  /** 오타 교정 없이 입력 그대로. web `exact` — 교정 안내의 「그대로 검색」이 켜고, 새 검색(submit)의 resetFilters 가 끈다. */
  exact: boolean;
};

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  categoryIds: [],
  providerIds: [],
  sort: 'recent',
  period: 'all',
  ended: false,
  exact: false,
};
