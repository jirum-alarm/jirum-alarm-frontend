'use client';

import { useEffect, useRef, useState } from 'react';

import { Cancel, Search } from '@/shared/ui/common/icons';

import { useSearchAutocompleteViewModel } from '../hooks/useSearchAutocompleteViewModel';
import { useSearchInputViewModel } from '../hooks/useSearchInputViewModel';

import SearchAutocompleteDropdown from './SearchAutocompleteDropdown';

const SearchInput = () => {
  const { keyword, onKeyDown, handleChange, handleReset, submitKeyword } =
    useSearchInputViewModel();

  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const { suggestions, hasPrefix } = useSearchAutocompleteViewModel({
    value: keyword,
    isComposing,
    enabled: isFocused,
  });

  const dropdownOpen = isFocused && hasPrefix && suggestions.length > 0;

  // 입력값이 바뀌면 active index 초기화
  useEffect(() => {
    setActiveIndex(-1);
  }, [keyword]);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!isFocused) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (target && containerRef.current && !containerRef.current.contains(target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [isFocused]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // 한글 IME 조합 중 키 이벤트는 무시 (Safari/일부 브라우저에서 keyCode 229 또는 isComposing)
    if (event.nativeEvent.isComposing || event.keyCode === 229) {
      return;
    }
    if (!dropdownOpen) {
      onKeyDown(event);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (event.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        event.preventDefault();
        submitKeyword(suggestions[activeIndex]);
        setIsFocused(false);
        return;
      }
      onKeyDown(event);
      setIsFocused(false);
    } else if (event.key === 'Escape') {
      setIsFocused(false);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    submitKeyword(suggestion);
    setIsFocused(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex w-full items-center overflow-hidden rounded-sm bg-gray-50 pl-3 focus-within:outline-1 focus-within:outline-gray-900 focus-within:outline-solid">
        <Search color="#98A2B3" className="shrink-0" />
        <input
          value={keyword ?? ''}
          className="h-10 w-full bg-gray-50 px-3 text-sm outline-hidden"
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          spellCheck={false}
          placeholder="핫딜 제품을 검색해 주세요"
          autoFocus
          inputMode="search"
        />

        {keyword && <ResetButton handleReset={handleReset} />}
      </div>

      {dropdownOpen && (
        <SearchAutocompleteDropdown
          suggestions={suggestions}
          activeIndex={activeIndex}
          onHover={setActiveIndex}
          onSelect={handleSuggestionSelect}
          highlight={(keyword ?? '').trim()}
        />
      )}
    </div>
  );
};

export default SearchInput;

function ResetButton({ handleReset }: { handleReset: () => void }) {
  return (
    <button
      className="-m-2 grid h-full w-14 cursor-pointer place-items-center p-2 text-gray-300"
      type="reset"
      onClick={handleReset}
    >
      <Cancel />
    </button>
  );
}
