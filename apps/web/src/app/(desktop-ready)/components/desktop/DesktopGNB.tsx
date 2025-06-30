'use client';

import { usePathname } from 'next/navigation';

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

import MenuLink from './MenuLink';

const DesktopGNB = () => {
  const { me } = useUser();

  const scrollThreshold = 720;

  const isScrolled = useScrollPosition(scrollThreshold, false);

  const handleSearchClick = () => {
    // TODO: Need GTM Migration
    // mp?.track(EVENT.PRODUCT_SEARCH.NAME, {
    //   type: EVENT.PRODUCT_SEARCH.TYPE.CLICK,
    //   page: EVENT.PAGE.HOME,
    // });
  };

  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        'fixed top-0 z-50 w-full border-b bg-white shadow-sm transition-all duration-300 lg:translate-y-0',
        {
          'translate-y-0 border-b-gray-200 bg-white': isScrolled,
          '-translate-y-full border-b-gray-700 bg-gray-900': !isScrolled,
        },
      )}
    >
      <header className="mx-auto flex h-[56px] w-full max-w-screen-layout-max items-center justify-between px-5 xl:px-0">
        <div className="flex h-full gap-x-11">
          <LogoLink inverted={isScrolled} />
          <div className="flex h-full items-center gap-x-10">
            <MenuLink href={PAGE.HOME} label="홈" isActive={isActive(PAGE.HOME)} />
            <MenuLink href={PAGE.RECOMMEND} label="추천" isActive={isActive(PAGE.RECOMMEND)} />
            <MenuLink href={PAGE.TRENDING} label="랭킹" isActive={isActive(PAGE.TRENDING)} />
          </div>
        </div>
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
            <Link href={PAGE.MYPAGE} className="size-8">
              <My width={32} height={32} color={isScrolled ? '#101828' : '#FFFFFF'} />
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

export default DesktopGNB;
