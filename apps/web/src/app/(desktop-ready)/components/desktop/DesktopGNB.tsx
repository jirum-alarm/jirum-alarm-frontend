'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { My } from '@/components/common/icons';
import TalkDark from '@/components/common/icons/TalkDark';
import TalkLight from '@/components/common/icons/TalkLight';
import LogoLink from '@/components/common/Logo/LogoLink';
import SearchLinkButton from '@/components/SearchLinkButton';
import { LANDING_URL } from '@/constants/env';
import { PAGE } from '@/constants/page';
import useScrollPosition from '@/hooks/useScrollPosition';
import { cn } from '@/lib/cn';

import Link from '@shared/ui/Link';

import NavLink from './MenuLink';

const HOME_SCROLLTHRESHOLD = 720;
const talkroomLink = 'https://open.kakao.com/o/gJZTWAAg';

const DesktopGNB = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const isScrolled = useScrollPosition(HOME_SCROLLTHRESHOLD);

  const pathname = usePathname();

  const isInHomeHero = useMemo(() => pathname === PAGE.HOME && !isScrolled, [pathname, isScrolled]);

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div
      className={cn(
        'fixed top-0 z-50 w-full min-w-5xl border-b bg-white shadow-xs transition-all duration-300',
        {
          'border-b-gray-200 bg-white': !isInHomeHero,
          'border-b-gray-700 bg-gray-900': isInHomeHero,
        },
      )}
    >
      <header className="max-w-layout-max mx-auto flex h-14 w-full items-center justify-between px-5">
        <nav className="flex h-full items-center gap-x-11">
          <LogoLink inverted={isInHomeHero} />
          <div className="flex h-full items-center gap-x-10">
            <NavLink
              href={PAGE.HOME}
              label="홈"
              isActive={isActive(PAGE.HOME)}
              isInverted={isInHomeHero}
            />
            <NavLink
              href={PAGE.RECOMMEND}
              label="추천"
              isActive={isActive(PAGE.RECOMMEND)}
              isInverted={isInHomeHero}
            />
            <NavLink
              href={PAGE.TRENDING}
              label="랭킹"
              isActive={isActive(PAGE.TRENDING)}
              isInverted={isInHomeHero}
            />
            <NavLink
              href={LANDING_URL}
              label="소개"
              prefetch={false}
              isActive={isActive(LANDING_URL)}
              isInverted={isInHomeHero}
            />
          </div>
        </nav>
        <div className="flex items-center gap-x-5">
          <SearchLinkButton color={isInHomeHero ? '#FFFFFF' : '#101828'} />
          <Link
            href={talkroomLink}
            target="_blank"
            className="relative size-9 rounded-full duration-300 hover:bg-gray-400/20"
            aria-label="핫딜 카톡방 입장"
          >
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center transition-opacity',
                {
                  'opacity-100': isInHomeHero,
                  'opacity-0': !isInHomeHero,
                },
              )}
            >
              <TalkDark className="mt-0.25 size-full p-0.5" />
            </div>
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center transition-opacity',
                {
                  'opacity-100': !isInHomeHero,
                  'opacity-0': isInHomeHero,
                },
              )}
            >
              <TalkLight className="mt-0.25 size-full p-0.5" />
            </div>
          </Link>
          {isLoggedIn ? (
            <Link
              href={PAGE.MYPAGE}
              className="flex size-8 items-center justify-center rounded-full duration-300 hover:bg-gray-400/20"
            >
              <My width={28} height={28} color={isInHomeHero ? '#FFFFFF' : '#101828'} />
            </Link>
          ) : (
            <Link
              href={PAGE.LOGIN}
              className="rounded-full bg-gray-700 px-4 py-1.5 font-semibold text-white transition-colors duration-300 hover:bg-gray-600"
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
