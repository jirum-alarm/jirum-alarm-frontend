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
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 자동완성 호출은 사용자가 실제로 입력한 원본 키워드 기준.
  const { suggestions, hasPrefix } = useSearchAutocompleteViewModel({
    value: keyword,
    isComposing,
    enabled: isFocused,
  });

  const dropdownOpen = isFocused && hasPrefix && suggestions.length > 0;

  // 활성 항목 표시값 override는 IME 조합 중에는 적용하지 않는다.
  // (모바일 IME는 controlled input value를 매 렌더 강제하면 조합이 깨지는 경우가 있음)
  const showActiveOverride =
    !isComposing && dropdownOpen && activeIndex >= 0 && activeIndex < suggestions.length;
  const displayValue = showActiveOverride ? suggestions[activeIndex] : (keyword ?? '');

  // 키워드가 사용자 입력으로 바뀌면 활성 인덱스 초기화
  useEffect(() => {
    setActiveIndex(-1);
  }, [keyword]);

  // 바깥 클릭/탭 시 닫기
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // 사용자가 타이핑할 때마다 드롭다운이 다시 열리도록 보장
    setIsFocused(true);
    setActiveIndex(-1);
    handleChange(event);
  };

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
      setActiveIndex((prev) => (prev <= -1 ? suggestions.length - 1 : prev === 0 ? -1 : prev - 1));
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
      if (activeIndex >= 0) {
        setActiveIndex(-1);
      } else {
        setIsFocused(false);
      }
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    submitKeyword(suggestion);
    setIsFocused(false);
    // 선택 후 input에 포커스 유지하지 않고 키보드도 내림 (모바일 UX)
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="bg-surface-subtle flex w-full items-center overflow-hidden rounded-sm pl-3 focus-within:outline-1 focus-within:outline-gray-900 focus-within:outline-solid">
        <Search color="#98A2B3" className="shrink-0" />
        <input
          ref={inputRef}
          value={displayValue}
          className="bg-surface-subtle h-10 w-full px-3 text-sm outline-hidden"
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onInput={(e) => {
            // 일부 모바일 IME(특히 안드로이드 chromium)는 onChange를 빠뜨리고 onInput만
            // 발화하는 케이스가 있어, value가 keyword와 다르면 강제로 동기화한다.
            const next = e.currentTarget.value;
            if (next !== (keyword ?? '')) {
              setIsFocused(true);
              setActiveIndex(-1);
              handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
            }
          }}
          spellCheck={false}
          placeholder="핫딜 제품을 검색해 주세요"
          autoFocus
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
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
