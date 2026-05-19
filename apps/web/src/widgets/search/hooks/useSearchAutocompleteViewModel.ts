'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { SearchService } from '@/shared/api/search/search.service';

const DEBOUNCE_MS = 200;
const MIN_PREFIX_LENGTH_KOREAN = 1;
const MIN_PREFIX_LENGTH_OTHER = 2;
const SUGGESTION_LIMIT = 10;

const HAS_KOREAN = /[가-힣]/;

function isPrefixValid(p: string): boolean {
  const trimmed = p.trim();
  if (!trimmed) return false;
  return HAS_KOREAN.test(trimmed)
    ? trimmed.length >= MIN_PREFIX_LENGTH_KOREAN
    : trimmed.length >= MIN_PREFIX_LENGTH_OTHER;
}

interface UseSearchAutocompleteParams {
  /** 입력 현재 값 */
  value: string | null | undefined;
  /** 한글 IME 조합 중인지 */
  isComposing: boolean;
  /** 드롭다운을 열어야 하는지 (input focus 등 외부 신호) */
  enabled: boolean;
}

/**
 * 자동완성 ViewModel.
 *  - 입력값을 debounce
 *  - IME 조합 중에는 호출 안 함 (한글 입력 도중 호출 폭주 방지)
 *  - prefix가 너무 짧으면 호출 안 함 (한글 1자, 영문/숫자 2자 이상)
 */
export const useSearchAutocompleteViewModel = (params: UseSearchAutocompleteParams) => {
  const { value, isComposing, enabled } = params;
  const [debounced, setDebounced] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isComposing) return; // 조합 중에는 갱신 보류
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebounced((value ?? '').trim());
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, isComposing]);

  const validPrefix = enabled && isPrefixValid(debounced) ? debounced : '';

  const { data, isFetching } = useQuery({
    queryKey: ['search-suggestions', validPrefix],
    queryFn: () => SearchService.getSuggestions({ prefix: validPrefix, limit: SUGGESTION_LIMIT }),
    enabled: Boolean(validPrefix),
    staleTime: 60_000, // 동일 prefix는 1분 캐시
    gcTime: 300_000,
  });

  return {
    suggestions: validPrefix ? (data ?? []) : [],
    isFetching,
    hasPrefix: Boolean(validPrefix),
  };
};
