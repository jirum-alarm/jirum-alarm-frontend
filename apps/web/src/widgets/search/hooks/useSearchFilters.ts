'use client';

import { hasActiveSearchFilters, SEARCH_PERIODS, SEARCH_SORTS } from '@jirum/domain/search';
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';

// 필터 후보·라벨·규칙은 앱과 같은 @jirum/domain/search 정본. 여기선 web 의 URL 상태(nuqs)만.
export {
  SEARCH_PERIODS,
  SEARCH_SORTS,
  type SearchPeriod,
  type SearchSort,
} from '@jirum/domain/search';

/**
 * 검색 필터 상태. URL 쿼리스트링이 단일 소스 — 공유/뒤로가기에도 필터가 유지된다.
 * categoryIds/providerIds 빈 배열 = 전체(미적용). history replace라 필터 조작이 브라우저 히스토리를 오염시키지 않는다.
 * 소유자는 SearchResult 하나 — FilterBar/viewModel에는 값·setter를 내려보낸다.
 * 필터 변경 시 화면 유지는 viewModel의 keepPreviousData가 담당(훅 주석 참고).
 * shallow+scroll:false — 필터 클릭이 Next 내비게이션/스크롤 점프로 안 보이게 막고, 칩·목록은 클라이언트에서 즉시 갱신한다.
 */
export const useSearchFilters = () => {
  const [filters, setFilters] = useQueryStates(
    {
      categoryIds: parseAsArrayOf(parseAsInteger).withDefault([]),
      providerIds: parseAsArrayOf(parseAsInteger).withDefault([]),
      sort: parseAsStringLiteral(SEARCH_SORTS).withDefault('recent'),
      period: parseAsStringLiteral(SEARCH_PERIODS).withDefault('all'),
      ended: parseAsBoolean.withDefault(false),
      // 오타 교정 없이 그대로 — 교정 안내의 「그대로 검색」이 켠다(searchHref exact). 새 검색 주소엔 안 붙어 저절로 꺼진다.
      exact: parseAsBoolean.withDefault(false),
    },
    { history: 'replace', shallow: true, scroll: false },
  );

  const hasActiveFilters = hasActiveSearchFilters(filters);

  const resetFilters = () =>
    setFilters({
      categoryIds: null,
      providerIds: null,
      sort: null,
      period: null,
      ended: null,
      exact: null,
    });

  const toggleCategoryId = (id: number) => {
    setFilters((prev) => {
      const next = prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((x) => x !== id)
        : [...prev.categoryIds, id];
      return { categoryIds: next.length > 0 ? next : null };
    });
  };

  const toggleProviderId = (id: number) => {
    setFilters((prev) => {
      const next = prev.providerIds.includes(id)
        ? prev.providerIds.filter((x) => x !== id)
        : [...prev.providerIds, id];
      return { providerIds: next.length > 0 ? next : null };
    });
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
