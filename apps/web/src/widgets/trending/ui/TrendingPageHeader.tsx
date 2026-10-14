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
      <PageTabNavigation />
      {/* <SearchLinkButton color="var(--color-gray-800)" /> */}
    </PageHeader>
  );
};

export default TrendingPageHeader;
