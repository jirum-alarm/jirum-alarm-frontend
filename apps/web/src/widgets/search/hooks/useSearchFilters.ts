'use client';

import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';

export const SEARCH_SORTS = ['recent', 'comments', 'relevance'] as const;
export type SearchSort = (typeof SEARCH_SORTS)[number];

export const SEARCH_PERIODS = ['all', '1d', '7d', '30d'] as const;
export type SearchPeriod = (typeof SEARCH_PERIODS)[number];

/**
 * 검색 필터 상태. URL 쿼리스트링이 단일 소스 — 공유/뒤로가기에도 필터가 유지된다.
 * categoryIds/providerIds 빈 배열 = 전체(미적용). history replace라 필터 조작이 브라우저 히스토리를 오염시키지 않는다.
 * 소유자는 SearchResult 하나 — FilterBar/viewModel에는 값·setter를 내려보낸다.
 * 필터 변경 시 화면 유지는 viewModel의 keepPreviousData가 담당(훅 주석 참고).
 */
export const useSearchFilters = () => {
  const [filters, setFilters] = useQueryStates(
    {
      categoryIds: parseAsArrayOf(parseAsInteger).withDefault([]),
      providerIds: parseAsArrayOf(parseAsInteger).withDefault([]),
      sort: parseAsStringLiteral(SEARCH_SORTS).withDefault('recent'),
      period: parseAsStringLiteral(SEARCH_PERIODS).withDefault('all'),
      ended: parseAsBoolean.withDefault(false),
    },
    { history: 'replace' },
  );

  const hasActiveFilters =
    filters.categoryIds.length > 0 ||
    filters.providerIds.length > 0 ||
    filters.ended ||
    filters.period !== 'all';

  const resetFilters = () =>
    setFilters({
      categoryIds: null,
      providerIds: null,
      sort: null,
      period: null,
      ended: null,
    });

  const toggleCategoryId = (id: number) => {
    const next = filters.categoryIds.includes(id)
      ? filters.categoryIds.filter((x) => x !== id)
      : [...filters.categoryIds, id];
    setFilters({ categoryIds: next.length > 0 ? next : null });
  };

  const toggleProviderId = (id: number) => {
    const next = filters.providerIds.includes(id)
      ? filters.providerIds.filter((x) => x !== id)
      : [...filters.providerIds, id];
    setFilters({ providerIds: next.length > 0 ? next : null });
  };

  return {
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters,
    toggleCategoryId,
    toggleProviderId,
  };
};

export type SearchFiltersController = ReturnType<typeof useSearchFilters>;
