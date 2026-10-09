'use client';

import Chip from '@/shared/ui/common/Chip';

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
    return (e: React.MouseEvent<HTMLButtonElement>) => {
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
        <li key={keyword} className="shrink-0">
          <Chip selected={selectedKeyword === keyword} onClick={handleKeywordClick(keyword)}>
            {keyword}
          </Chip>
        </li>
      ))}
    </ul>
  );
};

export default RecommendedProductTabs;
