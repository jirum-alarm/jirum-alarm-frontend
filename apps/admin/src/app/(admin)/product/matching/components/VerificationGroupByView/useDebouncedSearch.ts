import { useCallback, useRef, useState } from 'react';

// 입력값과 300ms 뒤 확정값을 따로 둔다 — 목록 재조회는 확정값에만 반응한다.
export function useDebouncedSearch() {
  // ── 검색 상태 ──
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const searchThrottleRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchThrottleRef.current) clearTimeout(searchThrottleRef.current);
    searchThrottleRef.current = setTimeout(() => setDebouncedSearchQuery(value), 300);
  }, []);

  return { searchQuery, debouncedSearchQuery, handleSearchChange };
}
