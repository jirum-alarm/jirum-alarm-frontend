'use client';

import SearchLinkButton from '@/components/SearchLinkButton';
import { useHeaderVisibility } from '@/hooks/useScrollDirection';
import { cn } from '@/lib/cn';

const TrendingPageHeader = () => {
  const isHeaderVisible = useHeaderVisibility();
  return (
    <header
      className={cn(
        `max-w-mobile-max fixed top-0 z-50 flex h-14 w-full items-center justify-between bg-white px-5 transition-transform`,
        {
          'translate-y-0': isHeaderVisible,
          '-translate-y-14': !isHeaderVisible,
        },
      )}
    >
      <h1 className="text-lg font-bold">지름알림 랭킹</h1>
      <SearchLinkButton color="#1d2939" />
    </header>
  );
};

export default TrendingPageHeader;
