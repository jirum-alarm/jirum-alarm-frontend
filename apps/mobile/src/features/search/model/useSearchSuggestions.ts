import {useEffect, useRef, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {isPrefixValid} from '@jirum/domain/search';

import {SearchQueries} from '@/entities/search/api/search.queries';

/**
 * 자동완성 ViewModel. web: widgets/search/hooks/useSearchAutocompleteViewModel
 *
 * ★web 의 `isComposing`(IME 조합) 분기는 옮기지 않는다 — RN `TextInput` 은
 * composition 이벤트를 주지 않고, 한글 조합 중에도 `onChangeText` 가 완성된
 * 음절 단위로만 온다. web 의 긴 디바운스(350ms)는 브라우저 IME 가 자모마다
 * change 를 쏘는 걸 막으려던 것이라 앱엔 해당 사항이 없다.
 */
const DEBOUNCE_MS = 200;

// 최소 길이 판정(isPrefixValid)은 web 과 같은 @jirum/domain/search.
export {isPrefixValid};

export function useSearchSuggestions({
  value,
  enabled,
}: {
  value: string;
  /** 입력창이 포커스돼 드롭다운을 열어야 하는지. */
  enabled: boolean;
}) {
  const [debounced, setDebounced] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => setDebounced(value.trim()),
      DEBOUNCE_MS,
    );
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value]);

  const validPrefix = enabled && isPrefixValid(debounced) ? debounced : '';

  const {data} = useQuery(SearchQueries.suggestions(validPrefix));

  return {
    suggestions: validPrefix ? data ?? [] : [],
    hasPrefix: Boolean(validPrefix),
  };
}
