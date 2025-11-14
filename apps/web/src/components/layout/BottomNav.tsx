'use client';

import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { createElement, useRef } from 'react';

import {
  Alert,
  AlertFill,
  Find,
  FindFill,
  Home,
  HomeFill,
  My,
  MyFill,
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
    isActive: (pathName: string) => pathName === PAGE.HOME,
  },
  {
    type: NAV_TYPE.TRENDING,
    getLink: (pathName: string) =>
      pathName === PAGE.TRENDING_RANKING ? PAGE.TRENDING_LIVE : PAGE.TRENDING_RANKING,
    text: '발견',
    icon: Find,
    activeIcon: FindFill,
    isActive: (pathName: string) => pathName.startsWith(PAGE.TRENDING),
  },
  {
    type: NAV_TYPE.ALARM,
    link: PAGE.ALARM,
    text: '알림',
    icon: Alert,
    activeIcon: AlertFill,
    isActive: (pathName: string) => pathName.startsWith(PAGE.ALARM),
  },
  {
    type: NAV_TYPE.MYPAGE,
    link: PAGE.MYPAGE,
    text: '내정보',
    icon: My,
    activeIcon: MyFill,
    isActive: (pathName: string) => pathName.startsWith(PAGE.MYPAGE),
  },
];

// 1. 링크를 기준으로 active
// 2. touch start나 mouse down으로 active 후 링크가 이동 안 됐으면 unactive

const BottomNavComponent = () => {
  const pathName = usePathname();
  const navRef = useRef<HTMLUListElement>(null);
  const isBottomNavVisible = useHeaderVisibility();

  const isActiveNav = (nav: (typeof BottomNavList)[number]) => {
    return nav.isActive(pathName);
  };

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
                  'text-gray-900': isActiveNav(nav),
                },
              )}
              href={nav.link ?? nav.getLink(pathName)}
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
                  {createElement(isActiveNav(nav) ? nav.activeIcon : nav.icon)}
                </div>
                <span
                  className={cn('text-xs', {
                    'font-semibold': isActiveNav(nav),
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
  if (!BottomNavList.some((nav) => nav.isActive(pathName))) return null;
  return <BottomNavComponent />;
}
