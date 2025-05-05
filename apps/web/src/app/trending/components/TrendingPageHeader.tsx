'use client';

import SearchLinkButton from '@/components/SearchLinkButton';
import useVisibilityOnScroll from '@/hooks/useVisibilityOnScroll';
import { cn } from '@/lib/cn';

const TrendingPageHeader = () => {
  const { isHeaderVisible } = useVisibilityOnScroll();
  return (
    <header
      className={cn(
        `fixed top-0 z-50 flex h-[56px] w-full max-w-screen-txs items-center justify-between bg-white px-5 transition-transform txs:max-w-screen-xs xs:max-w-screen-smd smd:max-w-screen-layout-max`,
        {
          'translate-y-0': isHeaderVisible,
          'translate-y-[-56px]': !isHeaderVisible,
        },
      )}
    >
      <h2 className="text-lg font-bold">지름알림 랭킹</h2>
      <SearchLinkButton color="#1d2939" />
    </header>
  );
};

export default TrendingPageHeader;
