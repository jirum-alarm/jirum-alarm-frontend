'use client';

import { useHeaderVisibility } from '@/shared/hooks/useScrollDirection';
import { cn } from '@/shared/lib/cn';
import PageHeader from '@/shared/ui/layout/PageHeader';

import PageTabNavigation from './PageTabNavigation';

const TrendingPageHeader = () => {
  const isHeaderVisible = useHeaderVisibility();
  return (
    <PageHeader
      className={cn('transition-transform', {
        'translate-y-0': isHeaderVisible,
        '-translate-y-14': !isHeaderVisible,
      })}
    >
      <h1 className="sr-only">지금 뜨는 핫딜 · 실시간 인기 상품</h1>
      <PageTabNavigation />
      {/* <SearchLinkButton color="#1d2939" /> */}
    </PageHeader>
  );
};

export default TrendingPageHeader;
