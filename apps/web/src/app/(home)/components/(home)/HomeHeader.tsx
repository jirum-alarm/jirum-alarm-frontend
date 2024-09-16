'use client';
import { Logo } from '@/components/common/icons';
import SearchLinkButton from '@/components/SearchLinkButton';
import { EVENT } from '@/constants/mixpanel';
import useScrollPosition from '@/hooks/useScrollPosition';
import { cn } from '@/lib/cn';
import { mp } from '@/lib/mixpanel';
import LogoLink from '../../../../components/common/Logo/LogiLink';

const HomeHeader = () => {
  const isScrolled = useScrollPosition(90);

  const handleSearchClick = () => {
    mp.track(EVENT.PRODUCT_SEARCH.NAME, {
      type: EVENT.PRODUCT_SEARCH.TYPE.CLICK,
      page: EVENT.PAGE.HOME,
    });
  };

  return (
    <header
      className={cn(
        `fixed top-0 z-50 flex w-full max-w-screen-layout-max items-center justify-between bg-white px-5 py-2 transition-all duration-300`,
        {
          'translate-y-0 shadow-sm': isScrolled,
          '-translate-y-full': !isScrolled,
        },
      )}
    >
      <LogoLink />
      <SearchLinkButton color="#101828" onClick={handleSearchClick} />
    </header>
  );
};

export default HomeHeader;
