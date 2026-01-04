'use client';

import useScrollPosition from '@/shared/hooks/useScrollPosition';
import { cn } from '@/shared/lib/cn';
import LogoLink from '@/shared/ui/Logo/LogoLink';

import SearchLinkButton from '@/features/search/ui/SearchLinkButton';

const HomeHeader = () => {
  const scrollThreshold = 90;

  const isScrolled = useScrollPosition(scrollThreshold);

  return (
    <div
      className={cn(
        'max-w-mobile-max fixed top-0 z-50 w-full bg-white shadow-xs transition-all duration-300',
        {
          'translate-y-0': isScrolled,
          '-translate-y-full': !isScrolled,
        },
      )}
    >
      <header className="max-w-mobile-max mx-auto flex h-14 w-full items-center justify-between px-5 py-2">
        <LogoLink />
        <div className="flex items-center gap-x-5">
          <SearchLinkButton color="#101828" />
        </div>
      </header>
    </div>
  );
};

export default HomeHeader;
