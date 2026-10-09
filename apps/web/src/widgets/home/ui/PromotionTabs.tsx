'use client';

import Chip from '@/shared/ui/common/Chip';

import { PromotionTab } from '@/entities/promotion/model/types';

interface PromotionTabsProps {
  tabs: PromotionTab[];
  activeTabId: string;
  onTabClick: (tab: PromotionTab) => void;
}

const PromotionTabs = ({ tabs, activeTabId, onTabClick }: PromotionTabsProps) => {
  const handleTabClick = (tab: PromotionTab) => {
    return (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      onTabClick(tab);
    };
  };

  return (
    <ul className="scrollbar-hide pc:pt-3 pc: flex w-fit max-w-full space-x-2 overflow-x-auto px-5 pb-2">
      {tabs.map((tab) => (
        <li key={tab.id} className="shrink-0">
          <Chip selected={activeTabId === tab.id} onClick={handleTabClick(tab)}>
            {tab.label}
          </Chip>
        </li>
      ))}
    </ul>
  );
};

export default PromotionTabs;
