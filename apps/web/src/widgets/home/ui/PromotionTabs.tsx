'use client';

import { motion } from 'motion/react';

import { cn } from '@/shared/lib/cn';

import { PromotionTab } from '@/entities/promotion/model/types';

interface PromotionTabsProps {
  tabs: PromotionTab[];
  activeTabId: string;
  onTabClick: (tab: PromotionTab) => void;
}

const PromotionTabs = ({ tabs, activeTabId, onTabClick }: PromotionTabsProps) => {
  const handleTabClick = (tab: PromotionTab) => {
    return (e: React.MouseEvent<HTMLLIElement>) => {
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
        <li
          key={tab.id}
          onClick={handleTabClick(tab)}
          className={cn(`shrink-0 cursor-pointer rounded-[40px] border transition-all`, {
            'border-secondary-500 bg-secondary-50 text-secondary-800 font-semibold':
              activeTabId === tab.id,
            'border-gray-300 bg-white text-gray-700': activeTabId !== tab.id,
          })}
        >
          <motion.button
            className="px-[16px] py-[6px]"
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            {tab.label}
          </motion.button>
        </li>
      ))}
    </ul>
  );
};

export default PromotionTabs;
