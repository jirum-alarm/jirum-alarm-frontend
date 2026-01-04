'use client';

import { useHeaderVisibility } from '@/shared/hooks/useScrollDirection';
import { cn } from '@/shared/lib/cn';

import { SearchLinkButton } from '@/features/search';

import PageTabNavigation from './PageTabNavigation';

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
      <PageTabNavigation />
      {/* <h1 className="text-lg font-bold">발견</h1>
      <SearchLinkButton color="#1d2939" /> */}
    </header>
  );
};

export default TrendingPageHeader;
