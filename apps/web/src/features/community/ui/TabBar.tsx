'use client';

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
      {TABS.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
