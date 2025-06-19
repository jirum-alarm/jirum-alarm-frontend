'use client';

import LogoLink from '@/components/common/Logo/LogoLink';
import SearchLinkButton from '@/components/SearchLinkButton';
import useScrollPosition from '@/hooks/useScrollPosition';
import { cn } from '@/lib/cn';

const HomeHeader = ({ isMobile }: { isMobile: boolean }) => {
  const scrollThreshold = isMobile ? 90 : 800;

  const isScrolled = useScrollPosition(scrollThreshold, !isMobile);

  // useEffect(() => {
  //   const statusBar = document.querySelector('meta[name="theme-color"]');
  //   if (statusBar) {
  //     statusBar.setAttribute('content', '#101828');
  //   }
  //   return () => {
  //     if (statusBar) {
  //       statusBar.setAttribute('content', '#FFFFFF');
  //     }
  //   };
  // }, []);

  // useEffect(() => {
  //   const statusBar = document.querySelector('meta[name="theme-color"]');
  //   if (statusBar) {
  //     if (isScrolled) {
  //       statusBar.setAttribute('content', '#FFFFFF');
  //     } else {
  //       statusBar.setAttribute('content', '#101828');
  //     }
  //   }
  // }, [isScrolled]);

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
        'fixed top-0 z-50 w-full bg-white shadow-sm transition-all duration-300 lg:translate-y-0',
        {
          'translate-y-0 lg:bg-white': isScrolled,
          '-translate-y-full lg:bg-gray-900': !isScrolled,
        },
      )}
    >
      <header className="mx-auto flex h-[56px] w-full max-w-screen-layout-max items-center justify-between px-5 py-2">
        <LogoLink inverted={isScrolled} />
        <SearchLinkButton color="#101828" onClick={handleSearchClick} />
      </header>
    </div>
  );
};

export default HomeHeader;
