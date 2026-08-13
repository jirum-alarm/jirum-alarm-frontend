import React, { useState } from 'react';

import type { ComponentRenderProps } from '@json-render/react';

export function DealList({ children }: { children?: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const items = React.Children.toArray(children);
  const showMoreButton = items.length > 4 && !isExpanded;
  const visibleItems = isExpanded ? items : items.slice(0, 4);

  return (
    <div className="-mx-4 mt-3 flex flex-col gap-2.5 bg-gray-50/50 px-4 py-4 sm:mx-0 sm:rounded-2xl sm:border sm:border-gray-100 sm:px-5 sm:py-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-[14px] font-bold text-gray-900">
          <span className="flex size-5 items-center justify-center rounded-full bg-blue-100 text-[10px]">
            🔥
          </span>
          몰별 핫딜
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {visibleItems.map((child: any, idx: number) => (
          <div
            key={child.key || idx}
            className={idx === 0 ? 'hero-deal-wrapper col-span-2' : 'col-span-1'}
          >
            {child}
          </div>
        ))}
      </div>
      {showMoreButton && (
        <button
          onClick={() => setIsExpanded(true)}
          className="mt-2 w-full rounded-xl border border-gray-200 bg-white py-2.5 text-[13px] font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          {items.length - 4}개 더보기
        </button>
      )}
    </div>
  );
}
