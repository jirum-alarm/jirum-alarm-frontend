'use client';
import SearchButton from '@/app/(home)/components/(home)/SearchButton';
import useVisibilityOnScroll from '@/hooks/useVisibilityOnScroll';
import { cn } from '@/lib/cn';

const TrendingPageHeader = () => {
  const { isHeaderVisible } = useVisibilityOnScroll();
  return (
    <header
      className={cn(
        `fixed z-50 flex h-[56px] w-full max-w-[480px] items-center justify-between bg-white px-4 transition-[top]`,
        {
          'top-0': isHeaderVisible,
          '-top-[56px]': !isHeaderVisible,
        },
      )}
    >
      <h2 className="text-lg font-semibold">지름알림 랭킹</h2>
      <SearchButton color="#1d2939" />
    </header>
  );
};

export default TrendingPageHeader;
