'use client';

import LogoLink from '@/components/common/Logo/LogoLink';
import SearchLinkButton from '@/components/SearchLinkButton';
import useScrollPosition from '@/hooks/useScrollPosition';
import { cn } from '@/lib/cn';

const HomeHeader = () => {
  const scrollThreshold = 90;

  const isScrolled = useScrollPosition(scrollThreshold);

  const handleSearchClick = () => {
    // TODO: Need GTM Migration
    // mp?.track(EVENT.PRODUCT_SEARCH.NAME, {
    //   type: EVENT.PRODUCT_SEARCH.TYPE.CLICK,
    //   page: EVENT.PAGE.HOME,
    // });
  };

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
          <SearchLinkButton color="#101828" onClick={handleSearchClick} />
        </div>
      </header>
    </div>
  );
};

export default HomeHeader;
