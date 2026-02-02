'use client';

import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { LANDING_URL } from '@/shared/config/env';
import { PAGE } from '@/shared/config/page';
import useScrollPosition from '@/shared/hooks/useScrollPosition';
import { cn } from '@/shared/lib/cn';
import { My } from '@/shared/ui/common/icons';
import TalkDark from '@/shared/ui/common/icons/TalkDark';
import TalkLight from '@/shared/ui/common/icons/TalkLight';
import LogoLink from '@/shared/ui/common/Logo/LogoLink';
import Link from '@/shared/ui/Link';

import SearchLinkButton from '@/features/search/ui/SearchLinkButton';

import NavLink from './MenuLink';

const HOME_SCROLLTHRESHOLD = 720;
const talkroomLink = 'https://open.kakao.com/o/gJZTWAAg';

const NAV_LINKS = [
  {
    href: PAGE.HOME,
    label: '홈',
    isActive: (pathname: string) => pathname === PAGE.HOME,
  },
  {
    href: PAGE.RECOMMEND,
    label: '추천',
    isActive: (pathname: string) => pathname === PAGE.RECOMMEND,
  },
  {
    href: PAGE.TRENDING_LIVE,
    label: '실시간',
    isActive: (pathname: string) => pathname === PAGE.TRENDING_LIVE,
  },
  {
    href: PAGE.TRENDING_RANKING,
    label: '랭킹',
    isActive: (pathname: string) => pathname === PAGE.TRENDING_RANKING,
  },
];

const DesktopGNB = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const isScrolled = useScrollPosition(HOME_SCROLLTHRESHOLD);

  const pathname = usePathname();

  const isInHomeHero = useMemo(() => pathname === PAGE.HOME && !isScrolled, [pathname, isScrolled]);

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
            {NAV_LINKS.map((nav) => (
              <NavLink
                key={nav.href}
                href={nav.href}
                label={nav.label}
                isActive={nav.isActive(pathname)}
                isInverted={isInHomeHero}
              />
            ))}
            <NavLink
              href={LANDING_URL}
              label="소개"
              prefetch={false}
              isActive={pathname === LANDING_URL}
              isInverted={isInHomeHero}
            />
          </div>
        </nav>
        <div className="flex items-center gap-x-5">
          <SearchLinkButton color={isInHomeHero ? '#FFFFFF' : '#101828'} />
          <Link
            href={talkroomLink}
            target="_blank"
            className="group relative size-9 rounded-full duration-300 hover:bg-gray-400/20"
            aria-label="핫딜 카톡방 입장"
          >
            <motion.div
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="flex h-full w-full items-center justify-center"
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
            </motion.div>
          </Link>
          {isLoggedIn ? (
            <Link
              href={PAGE.MYPAGE}
              className="flex size-8 items-center justify-center rounded-full duration-300 hover:bg-gray-400/20"
            >
              <motion.div
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="flex items-center justify-center"
              >
                <My width={28} height={28} color={isInHomeHero ? '#FFFFFF' : '#101828'} />
              </motion.div>
            </Link>
          ) : (
            <Link
              href={PAGE.LOGIN}
              className="rounded-full bg-gray-700 px-4 py-1.5 font-semibold text-white transition-colors duration-300 hover:bg-gray-600"
            >
              <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
                로그인
              </motion.div>
            </Link>
          )}
        </div>
      </header>
    </div>
  );
};

export default DesktopGNB;
