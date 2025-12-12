'use client';

import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { createElement, useRef } from 'react';

import {
  Alert,
  AlertFill,
  Home,
  HomeFill,
  My,
  MyFill,
  Ranking,
  RankingFill,
} from '@/components/common/icons';
import { PAGE } from '@/constants/page';
import { useHeaderVisibility } from '@/hooks/useScrollDirection';
import { cn } from '@/lib/cn';

import Link from '@shared/ui/Link';

import TopButton from '../TopButton';

export enum NAV_TYPE {
  HOME = 'HOME',
  TRENDING = 'TRENDING',
  ALARM = 'ALARM',
  MYPAGE = 'MYPAGE',
}

const BottomNavList = [
  {
    type: NAV_TYPE.HOME,
    link: PAGE.HOME,
    text: '홈',
    icon: Home,
    activeIcon: HomeFill,
  },
  {
    type: NAV_TYPE.TRENDING,
    link: PAGE.TRENDING,
    text: '랭킹',
    icon: Ranking,
    activeIcon: RankingFill,
  },
  {
    type: NAV_TYPE.ALARM,
    link: PAGE.ALARM,
    text: '알림',
    icon: Alert,
    activeIcon: AlertFill,
  },
  {
    type: NAV_TYPE.MYPAGE,
    link: PAGE.MYPAGE,
    text: '내정보',
    icon: My,
    activeIcon: MyFill,
  },
] as const;

const BottomNavComponent = () => {
  const pathName = usePathname();
  const navRef = useRef<HTMLUListElement>(null);
  const isBottomNavVisible = useHeaderVisibility();

  const isActiveNav = (type: NAV_TYPE, link: string) => {
    return link === pathName;
  };

  if (pathName.startsWith(PAGE.MYPAGE)) {
    return null;
  }

  return (
    <nav
      className={cn(
        `max-w-mobile-max pb-safe-bottom fixed bottom-0 left-1/2 z-50 mx-auto w-full -translate-x-1/2 border-t border-t-[#D0D5DD] bg-white transition-all duration-300`,
        {
          'translate-y-full': !isBottomNavVisible,
          'translate-y-0': isBottomNavVisible,
        },
      )}
    >
      <TopButton />
      <ul className="flex items-center justify-around" ref={navRef}>
        {BottomNavList.map((nav, i) => (
          <li key={i} className="flex flex-1 items-center justify-center">
            <Link
              data-nav-type={nav.type}
              className={cn(
                'flex w-full flex-col items-center justify-center rounded-lg py-2 text-gray-500',
                {
                  'text-gray-900': isActiveNav(nav.type, nav.link),
                },
              )}
              href={nav.link}
            >
              <motion.div
                className="flex w-full flex-col items-center justify-center rounded-lg"
                whileTap={{ scale: 0.95, backgroundColor: '#F2F4F7' }}
                transition={{ duration: 0.1, backgroundColor: { duration: 0 } }}
              >
                <div
                  className="flex h-[36px] w-[48px] items-center justify-center"
                  aria-hidden="true"
                >
                  {createElement(isActiveNav(nav.type, nav.link) ? nav.activeIcon : nav.icon)}
                </div>
                <span
                  className={cn('text-xs', {
                    'font-semibold': isActiveNav(nav.type, nav.link),
                  })}
                >
                  {nav.text}
                </span>
              </motion.div>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default function BottomNav() {
  const pathName = usePathname();
  if (!BottomNavList.some((nav) => nav.link === pathName)) return null;
  return <BottomNavComponent />;
}
