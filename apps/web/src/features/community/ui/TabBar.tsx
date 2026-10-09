'use client';

import { tab } from '@jirum/design-system/recipes';

import { cn } from '@/shared/lib/cn';

import { CommunityTab } from '@/entities/community';

const TABS: { label: string; value: CommunityTab }[] = [
  { label: '전체', value: 'all' },
  { label: '인기', value: 'trending' },
  { label: '공지', value: 'notice' },
];

export default function TabBar({
  activeTab,
  onChange,
}: {
  activeTab: CommunityTab;
  onChange: (tab: CommunityTab) => void;
}) {
  return (
    <div className="flex items-center gap-x-2 px-5 py-3">
      {TABS.map((item) => {
        const isActive = activeTab === item.value;
        const t = isActive ? tab.neutral.selected : tab.neutral.idle;
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(item.value)}
            className={cn('transition-all active:scale-95', tab.size.sm, t.box, t.text)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
