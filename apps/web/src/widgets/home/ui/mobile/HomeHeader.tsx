'use client';

import { layout } from '@jirum/design-system/layout';

import useScrollPosition from '@/shared/hooks/useScrollPosition';
import { cn } from '@/shared/lib/cn';
import LogoLink from '@/shared/ui/common/Logo/LogoLink';

import SearchLinkButton from '@/features/search/ui/SearchLinkButton';

import AlarmLinkButton from '@/widgets/layout/ui/AlarmLinkButton';
import CommunityLinkButton from '@/widgets/layout/ui/CommunityLinkButton';
import HelpLinkButton from '@/widgets/layout/ui/HelpLinkButton';

const HomeHeader = () => {
  const scrollThreshold = layout.homeHeader.scrollThreshold;

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
          <HelpLinkButton color="var(--color-gray-900)" />
          <SearchLinkButton color="var(--color-gray-900)" onClick={handleSearchClick} />
          <CommunityLinkButton color="var(--color-gray-900)" />
          <AlarmLinkButton color="var(--color-gray-900)" />
        </div>
      </header>
    </div>
  );
};

export default HomeHeader;
