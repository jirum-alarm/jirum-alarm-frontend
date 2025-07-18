'use client';

import SearchLinkButton from '@/components/SearchLinkButton';
import useVisibilityOnScroll from '@/hooks/useVisibilityOnScroll';
import { cn } from '@/lib/cn';

const TrendingPageHeader = () => {
  const { isHeaderVisible } = useVisibilityOnScroll();
  return (
    <header
      className={cn(
        `fixed top-0 z-50 flex h-[56px] w-full max-w-screen-mobile-max items-center justify-between bg-white px-5 transition-transform`,
        {
          'translate-y-0': isHeaderVisible,
          'translate-y-[-56px]': !isHeaderVisible,
        },
      )}
    >
      <h1 className="text-lg font-bold">지름알림 랭킹</h1>
      <SearchLinkButton color="#1d2939" />
    </header>
  );
};

export default TrendingPageHeader;
