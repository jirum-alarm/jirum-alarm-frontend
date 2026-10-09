'use client';

import { tab } from '@jirum/design-system/recipes';
import { useQuery } from '@tanstack/react-query';

import { cn } from '@/shared/lib/cn';

import { fetchTossCategoryLabels } from './toss.api';

// 카테고리 인기 하위 탭(동적 categoryLabel). 홈/목록 공통.
// 섹션 탭과 그리드 사이(중간)에 뜨며, 카테고리 인기 섹션일 때만 노출.
export default function TossCategoryTabs({
  activeLabel,
  onSelect,
}: {
  activeLabel?: string;
  onSelect: (label: string) => void;
}) {
  const { data: labels = [] } = useQuery({
    queryKey: ['toss-category-labels'],
    queryFn: fetchTossCategoryLabels,
  });

  if (labels.length === 0) return null;

  return (
    <div className="no-scrollbar flex gap-x-2 overflow-x-auto px-5 py-1">
      {labels.map((label) => {
        const isActive = (activeLabel ?? labels[0]) === label;
        const t = isActive ? tab.neutral.selected : tab.neutral.idle;
        return (
          <button
            key={label}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(label)}
            className={cn(
              'shrink-0 whitespace-nowrap transition-colors',
              tab.size.sm,
              t.box,
              t.text,
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
