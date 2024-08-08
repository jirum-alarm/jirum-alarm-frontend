'use client';
import { cn } from '@/lib/cn';
import { Logo } from '@/components/common/icons';
import useVisibilityOnScroll from '@/hooks/useVisibilityOnScroll';
import SearchLinkButton from '@/components/SearchLinkButton';
import { mp } from '@/lib/mixpanel';
import { EVENT } from '@/constants/mixpanel';

const HomeHeader = () => {
  const { isHeaderVisible } = useVisibilityOnScroll({ visibilityThreshold: 90 });

  const handleSearchClick = () => {
    mp.track(EVENT.PRODUCT_SEARCH.NAME, {
      type: EVENT.PRODUCT_SEARCH.TYPE.CLICK,
      page: EVENT.PAGE.HOME,
    });
  };

  return (
    <header
      className={cn(
        `fixed top-0 z-50 flex w-full max-w-screen-layout-max items-center justify-between bg-white px-5 py-3 transition-opacity duration-500`,
        {
          'opacity-0': !isHeaderVisible,
          'opacity-100': isHeaderVisible,
        },
      )}
    >
      <div className="flex items-center gap-2">
        <Logo />
        <h2 className="text-lg font-semibold text-gray-900">지름알림</h2>
      </div>
      <SearchLinkButton color="#101828" onClick={handleSearchClick} />
    </header>
  );
};

export default HomeHeader;
