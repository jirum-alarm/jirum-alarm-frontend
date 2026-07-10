'use client';

import { useHeaderVisibility } from '@/shared/hooks/useScrollDirection';
import { cn } from '@/shared/lib/cn';

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
      <h1 className="sr-only">지금 뜨는 핫딜 · 실시간 인기 상품</h1>
      <PageTabNavigation />
      {/* <SearchLinkButton color="#1d2939" /> */}
    </header>
  );
};

export default TrendingPageHeader;
