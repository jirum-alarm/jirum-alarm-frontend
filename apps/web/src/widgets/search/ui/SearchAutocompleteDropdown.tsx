'use client';

import { useEffect, useRef } from 'react';

import { cn } from '@/shared/lib/cn';
import { Search } from '@/shared/ui/common/icons';

interface Props {
  suggestions: string[];
  activeIndex: number;
  onHover: (index: number) => void;
  onSelect: (suggestion: string) => void;
  /** 현재 입력 prefix — 매칭된 부분을 굵게 표시 */
  highlight: string;
}

export default function SearchAutocompleteDropdown({
  suggestions,
  activeIndex,
  onHover,
  onSelect,
  highlight,
}: Props) {
  const activeRef = useRef<HTMLLIElement | null>(null);

  // 키보드로 활성 항목이 바뀌면 그 항목이 보이도록 스크롤
  useEffect(() => {
    if (activeIndex < 0) return;
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <ul
      role="listbox"
      className="border-border-default absolute top-full right-0 left-0 z-[60] mt-1 max-h-80 overflow-y-auto rounded-sm border bg-white shadow-md"
    >
      {suggestions.map((s, i) => {
        const isActive = i === activeIndex;
        return (
          <li
            key={`${s}-${i}`}
            ref={isActive ? activeRef : null}
            role="option"
            aria-selected={isActive}
            // PC: mouseDown으로 input blur 전에 잡고, 모바일: touchEnd로 선택
            // (iOS Safari는 mouseDown emulation이 늦거나 누락되는 경우가 있음)
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(s);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onSelect(s);
            }}
            onMouseEnter={() => onHover(i)}
            className={cn(
              'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm',
              isActive ? 'bg-gray-100' : 'hover:bg-gray-50',
            )}
          >
            <Search color="#98A2B3" className="shrink-0" />
            <span className="truncate">{renderHighlighted(s, highlight)}</span>
          </li>
        );
      })}
    </ul>
  );
}

function renderHighlighted(text: string, highlight: string) {
  const h = highlight.trim().toLowerCase();
  if (!h) return text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(h);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-semibold text-gray-900">{text.slice(idx, idx + h.length)}</span>
      {text.slice(idx + h.length)}
    </>
  );
}
