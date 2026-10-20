'use client';

import { tab } from '@jirum/design-system/recipes';
import { COMMUNITY_TABS } from '@jirum/domain/community';

import { cn } from '@/shared/lib/cn';

import { CommunityTab } from '@/entities/community';

// 탭 순서·라벨은 정본 @jirum/domain/community(앱 탭 줄과 같은 표).
const TABS = COMMUNITY_TABS;

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
            className={cn('transition-all active:scale-95', tab.size.sm, t.box, t.text, t.hover)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
