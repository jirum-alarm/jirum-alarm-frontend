'use client';

import { m } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { PAGE } from '@/shared/config/page';
import { useHasNewAlarm } from '@/shared/hooks/useHasNewAlarm';
import useScrollPosition from '@/shared/hooks/useScrollPosition';
import { cn } from '@/shared/lib/cn';
import { trackAlarmLink } from '@/shared/lib/trackAlarmLink';
import { Alert, Search } from '@/shared/ui/common/icons';
import LogoLink from '@/shared/ui/common/Logo/LogoLink';
import Link from '@/shared/ui/Link';

import NavLink from './MenuLink';
import UserMenu from './UserMenu';

const HOME_SCROLLTHRESHOLD = 720;

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
          </div>
        </nav>
        {/* 이동(왼쪽) · 행동(검색·등록) · 개인(알림·내 메뉴)만 둔다. 소개·카톡방은 홈 배너·푸터에, 화면 모드는 내 메뉴·푸터에 있다. */}
        <div className="flex items-center gap-x-5">
          <Link
            href={PAGE.SEARCH}
            aria-label="검색"
            className={cn(
              'flex h-9 w-48 items-center gap-2 rounded-full px-3.5 text-sm transition-colors duration-300',
              {
                'bg-fixed-white/10 text-fixed-white/60 hover:bg-fixed-white/15': isInHomeHero,
                'bg-gray-100 text-gray-400 hover:bg-gray-200': !isInHomeHero,
              },
            )}
          >
            <Search
              width={18}
              height={18}
              color={isInHomeHero ? '#FFFFFF' : 'var(--color-gray-500)'}
            />
            {/* GNB 최소폭(min-w-5xl)에서 한 줄에 들어가게 w-48 — 더 넓히면 1024px 에서 넘친다. */}
            핫딜 검색
          </Link>
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
          {/* 데스크톱엔 하단 탭이 없어 알림함(→ 키워드 알림)으로 갈 길이 아예 없었다. */}
          {isLoggedIn && (
            <Link
              href={PAGE.ALARM}
              onClick={() => trackAlarmLink('gnb_bell')}
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
                  <span className="bg-error-500 absolute top-0.5 right-0.5 h-2 w-2 rounded-full" />
                )}
              </m.div>
            </Link>
          )}
          {isLoggedIn ? (
            <UserMenu color={isInHomeHero ? '#FFFFFF' : 'var(--color-gray-900)'} />
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
