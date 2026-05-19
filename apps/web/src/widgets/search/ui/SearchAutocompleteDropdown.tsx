'use client';

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
  return (
    <ul
      role="listbox"
      className="absolute top-full right-0 left-0 z-[60] mt-1 max-h-80 overflow-y-auto rounded-sm border border-gray-200 bg-white shadow-md"
    >
      {suggestions.map((s, i) => {
        const isActive = i === activeIndex;
        return (
          <li
            key={`${s}-${i}`}
            role="option"
            aria-selected={isActive}
            // mouseDown으로 처리해야 input blur 전에 선택이 잡힘
            onMouseDown={(e) => {
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
