'use client';

import { My } from '@/components/common/icons';
import TalkDark from '@/components/common/icons/TalkDark';
import TalkLight from '@/components/common/icons/TalkLight';
import LogoLink from '@/components/common/Logo/LogoLink';
import SearchLinkButton from '@/components/SearchLinkButton';
import { PAGE } from '@/constants/page';
import Link from '@/features/Link';
import useScrollPosition from '@/hooks/useScrollPosition';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/cn';

const HomeHeader = ({ isMobile }: { isMobile: boolean }) => {
  const { me } = useUser();

  const scrollThreshold = isMobile ? 90 : 800;

  const isScrolled = useScrollPosition(scrollThreshold, false);

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
        <div className="flex items-center gap-x-5">
          <SearchLinkButton
            color={isScrolled ? '#101828' : '#FFFFFF'}
            onClick={handleSearchClick}
          />
          <Link href={PAGE.MYPAGE} className="relative hidden size-8 lg:block">
            <TalkDark
              className={cn('size-8 transition-opacity', {
                'opacity-100': !isScrolled,
                'opacity-0': isScrolled,
              })}
            />
            <TalkLight
              className={cn('absolute inset-0 size-8 transition-opacity', {
                'opacity-0': !isScrolled,
                'opacity-100': isScrolled,
              })}
            />
          </Link>
          {me ? (
            <Link href={PAGE.MYPAGE} className="hidden size-8 lg:block">
              <My width={32} height={32} />
            </Link>
          ) : (
            <Link
              href={PAGE.LOGIN}
              className="hidden rounded-full bg-gray-700 px-4 py-2 font-semibold text-white lg:block"
            >
              로그인
            </Link>
          )}
        </div>
      </header>
    </div>
  );
};

export default HomeHeader;
