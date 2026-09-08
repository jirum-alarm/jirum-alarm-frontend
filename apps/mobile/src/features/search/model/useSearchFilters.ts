import {useCallback, useMemo, useState} from 'react';

import {
  DEFAULT_SEARCH_FILTERS,
  hasActiveFilters as computeHasActiveFilters,
  type SearchFilters,
} from '@/entities/search/model/filters';

/**
 * 검색 필터 상태. web: widgets/search/hooks/useSearchFilters(nuqs)
 *
 * ★소유자는 검색 화면 하나다. web 도 인스턴스가 둘이면 transition 이 깨져서
 * 한 곳에서만 만들고 값·setter 를 내려보낸다(그 훅 주석 참조).
 */
export function useSearchFilters() {
  const [filters, setFiltersState] = useState<SearchFilters>(
    DEFAULT_SEARCH_FILTERS,
  );

  const setFilters = useCallback((patch: Partial<SearchFilters>) => {
    setFiltersState(prev => ({...prev, ...patch}));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_SEARCH_FILTERS);
  }, []);

  const toggleCategoryId = useCallback((id: number) => {
    setFiltersState(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter(x => x !== id)
        : [...prev.categoryIds, id],
    }));
  }, []);

  const toggleProviderId = useCallback((id: number) => {
    setFiltersState(prev => ({
      ...prev,
      providerIds: prev.providerIds.includes(id)
        ? prev.providerIds.filter(x => x !== id)
        : [...prev.providerIds, id],
    }));
  }, []);

  const hasActiveFilters = useMemo(
    () => computeHasActiveFilters(filters),
    [filters],
  );

  return {
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters,
    toggleCategoryId,
    toggleProviderId,
  };
}

export type SearchFiltersController = ReturnType<typeof useSearchFilters>;
