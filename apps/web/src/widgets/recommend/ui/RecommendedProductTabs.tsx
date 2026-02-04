'use client';

import { motion } from 'motion/react';

import { cn } from '@/shared/lib/cn';

interface RecommendedProductTabsProps {
  productKeywords: string[];
  selectedKeyword: string;
  onSelectedKeyword: (keyword: string) => void;
}

const RecommendedProductTabs = ({
  productKeywords,
  onSelectedKeyword,
  selectedKeyword,
}: RecommendedProductTabsProps) => {
  const handleKeywordClick = (keyword: string) => {
    return (e: React.MouseEvent<HTMLLIElement>) => {
      e.currentTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      onSelectedKeyword(keyword);
    };
  };

  return (
    <ul className="scrollbar-hide flex w-fit max-w-full space-x-2 overflow-x-auto px-5">
      {productKeywords.map((keyword) => (
        <li
          key={keyword}
          onClick={handleKeywordClick(keyword)}
          className={cn(`shrink-0 rounded-[40px] border transition-all`, {
            'border-secondary-500 bg-secondary-50 text-secondary-800 font-semibold':
              selectedKeyword === keyword,
            'border-gray-300 bg-white text-gray-700': selectedKeyword !== keyword,
          })}
        >
          <motion.button
            className="px-[16px] py-[6px]"
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            {keyword}
          </motion.button>
        </li>
      ))}
    </ul>
  );
};

export default RecommendedProductTabs;
