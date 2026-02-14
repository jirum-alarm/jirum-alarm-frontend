'use client';

import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { createElement, useRef } from 'react';

import { PAGE } from '@/shared/config/page';
import { useDevice } from '@/shared/hooks/useDevice';
import { useHeaderVisibility } from '@/shared/hooks/useScrollDirection';
import { cn } from '@/shared/lib/cn';
import {
  Alert,
  AlertFill,
  Find,
  FindFill,
  Home,
  HomeFill,
  My,
  MyFill,
} from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

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
    isActive: (pathName: string) => pathName === PAGE.HOME || pathName === '',
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

const BottomNavComponent = () => {
  const pathName = usePathname();
  const navRef = useRef<HTMLUListElement>(null);
  const scrollVisibility = useHeaderVisibility();
  const isBottomNavVisible = pathName === PAGE.HOME ? true : scrollVisibility;

  const isActiveNav = (nav: (typeof BottomNavList)[number]) => {
    return nav.isActive(pathName);
  };

  return (
    <nav
      className={cn(
        'max-w-mobile-max fixed inset-x-0 bottom-0 z-[100] mx-auto min-h-[calc(56px+env(safe-area-inset-bottom))] w-full border-t border-t-[#D0D5DD] bg-white pb-[env(safe-area-inset-bottom)] transition-transform duration-300 will-change-transform',
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
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
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
  const {
    device: { isJirumAlarmApp },
    isHydrated,
  } = useDevice();
  const pathName = usePathname();

  // 앱 환경에서도 웹 바텀 네비게이션을 표시하도록 수정 (사용자 요청 대응)
  // if (isHydrated && isJirumAlarmApp) return null;

  if (!BottomNavList.some((nav) => nav.isActive(pathName))) return null;
  return <BottomNavComponent />;
}
