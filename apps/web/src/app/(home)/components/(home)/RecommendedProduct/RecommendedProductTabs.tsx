'use client';

import { cn } from '@/lib/cn';

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
    <ul className="no-wrap flex gap-2 overflow-x-scroll scrollbar-hide">
      {productKeywords.map((keyword) => (
        <li
          key={keyword}
          onClick={handleKeywordClick(keyword)}
          className={cn(`shrink-0 rounded-[40px] border transition-all`, {
            'border-secondary-500 bg-secondary-50 font-semibold text-secondary-800':
              selectedKeyword === keyword,
            'border-gray-300 bg-white text-gray-700': selectedKeyword !== keyword,
          })}
        >
          <button className="px-[16px] py-[6px]">{keyword}</button>
        </li>
      ))}
    </ul>
  );
};

export default RecommendedProductTabs;
