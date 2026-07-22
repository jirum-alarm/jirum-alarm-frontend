'use client';

import { parseAsBoolean, parseAsInteger, parseAsStringLiteral, useQueryStates } from 'nuqs';

export const SEARCH_SORTS = ['recent', 'relevance'] as const;
export type SearchSort = (typeof SEARCH_SORTS)[number];

/**
 * 검색 필터 상태. URL 쿼리스트링이 단일 소스 — 공유/뒤로가기에도 필터가 유지된다.
 * 0 = 전체(미적용). history replace라 필터 조작이 브라우저 히스토리를 오염시키지 않는다.
 */
export const useSearchFilters = () => {
  const [filters, setFilters] = useQueryStates(
    {
      categoryId: parseAsInteger.withDefault(0),
      providerId: parseAsInteger.withDefault(0),
      sort: parseAsStringLiteral(SEARCH_SORTS).withDefault('recent'),
      ended: parseAsBoolean.withDefault(false),
    },
    { history: 'replace' },
  );

  return { filters, setFilters };
};
