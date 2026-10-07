'use client';

import { m } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { LANDING_URL } from '@/shared/config/env';
import { PAGE } from '@/shared/config/page';
import { useHasNewAlarm } from '@/shared/hooks/useHasNewAlarm';
import useScrollPosition from '@/shared/hooks/useScrollPosition';
import { cn } from '@/shared/lib/cn';
import ColorSchemeButton from '@/shared/ui/ColorSchemeButton';
import { Alert, My } from '@/shared/ui/common/icons';
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
    href: PAGE.TRENDING_LIVE,
    label: '실시간',
    isActive: (pathname: string) => pathname === PAGE.TRENDING_LIVE,
  },
  {
    href: PAGE.TRENDING_RANKING,
    label: '랭킹',
    isActive: (pathname: string) => pathname === PAGE.TRENDING_RANKING,
  },
  {
    href: PAGE.DEALS,
    label: '최저가',
    isActive: (pathname: string) => pathname.startsWith(PAGE.DEALS),
  },
  {
    href: PAGE.COMMUNITY,
    label: '커뮤니티',
    isActive: (pathname: string) => pathname.startsWith(PAGE.COMMUNITY),
  },
];

const DesktopGNB = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const isScrolled = useScrollPosition(HOME_SCROLLTHRESHOLD);

  const pathname = usePathname();

  const hasNewAlarm = useHasNewAlarm();

  const isInHomeHero = useMemo(() => pathname === PAGE.HOME && !isScrolled, [pathname, isScrolled]);

  return (
    <div
      className={cn(
        'fixed top-0 z-50 w-full min-w-5xl border-b bg-white shadow-xs transition-all duration-300',
        {
          'border-b-gray-200 bg-white': !isInHomeHero,
          'border-b-fixed-700 bg-fixed-900': isInHomeHero,
        },
      )}
    >
      <header className="max-w-layout-max mx-auto flex h-14 w-full items-center justify-between px-5">
        <nav className="flex h-full items-center gap-x-11">
          {/* GNB 는 h-14 안에 네비 링크까지 들어가야 해서 로고는 한 줄로 둔다. */}
          <LogoLink inverted={isInHomeHero} subtitle={null} />
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
          <Link
            href={PAGE.PRODUCT_NEW}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors duration-300',
              {
                'border-fixed-white/40 text-fixed-white hover:bg-fixed-white/10': isInHomeHero,
                'border-gray-300 text-gray-700 hover:bg-gray-50': !isInHomeHero,
              },
            )}
          >
            <m.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
              핫딜 등록
            </m.div>
          </Link>
          <ColorSchemeButton color={isInHomeHero ? '#FFFFFF' : 'var(--color-gray-900)'} />
          <SearchLinkButton color={isInHomeHero ? '#FFFFFF' : 'var(--color-gray-900)'} />
          <Link
            href={talkroomLink}
            target="_blank"
            className="group relative size-9 rounded-full duration-300 hover:bg-gray-400/20"
            aria-label="핫딜 카톡방 입장"
          >
            <m.div
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
            </m.div>
          </Link>
          {/* 데스크톱엔 하단 탭이 없어 알림함(→ 키워드 알림)으로 갈 길이 아예 없었다. */}
          {isLoggedIn && (
            <Link
              href={PAGE.ALARM}
              aria-label={hasNewAlarm ? '알림, 새 알림 있음' : '알림'}
              className="flex size-8 items-center justify-center rounded-full duration-300 hover:bg-gray-400/20"
            >
              <m.div
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="relative flex items-center justify-center"
              >
                <Alert
                  width={28}
                  height={28}
                  style={{ color: isInHomeHero ? '#FFFFFF' : 'var(--color-gray-900)' }}
                />
                {hasNewAlarm && (
                  <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-[#EB001C]" />
                )}
              </m.div>
            </Link>
          )}
          {isLoggedIn ? (
            <Link
              href={PAGE.MYPAGE}
              className="flex size-8 items-center justify-center rounded-full duration-300 hover:bg-gray-400/20"
            >
              <m.div
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="flex items-center justify-center"
              >
                <My
                  width={28}
                  height={28}
                  color={isInHomeHero ? '#FFFFFF' : 'var(--color-gray-900)'}
                />
              </m.div>
            </Link>
          ) : (
            <Link
              href={PAGE.LOGIN}
              className="rounded-full bg-gray-700 px-4 py-1.5 font-semibold text-white transition-colors duration-300 hover:bg-gray-600"
            >
              <m.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
                로그인
              </m.div>
            </Link>
          )}
        </div>
      </header>
    </div>
  );
};

export default DesktopGNB;
