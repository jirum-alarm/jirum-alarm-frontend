'use client';
import {
  Alert,
  AlertFill,
  Home,
  HomeFill,
  Hot,
  HotFill,
  My,
  MyFill,
} from '@/components/common/icons';
import { IS_VERCEL_PRD } from '@/constants/env';
import { PAGE } from '@/constants/page';
import { cn } from '@/lib/cn';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

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
    text: '인기',
    icon: Hot,
    activeIcon: HotFill,
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

const BottomNav = ({ type }: { type: any }) => {
  const pathName = usePathname();
  if (IS_VERCEL_PRD) return;
  if (!BottomNavList.some((nav) => nav.link === pathName)) return;

  const isActivePath = (link: PAGE) => {
    return link === pathName;
  };
  return (
    <div
      className={cn(
        `fixed bottom-0 left-1/2 z-50 mx-auto w-full max-w-screen-layout-max -translate-x-1/2 border-t border-t-[#D0D5DD] bg-white pb-safe-bottom transition-transform`,
      )}
    >
      <ul className="flex items-center justify-around">
        {BottomNavList.map((nav, i) => (
          <li className="flex flex-1 items-center justify-center py-3" key={i}>
            <Link
              className={cn(
                // px-5
                'flex h-[46px] w-[68px] flex-col items-center justify-center rounded-lg text-gray-500',
                {
                  'text-gray-900': isActivePath(nav.link),
                },
              )}
              href={nav.link}
            >
              <button className="h-7 w-7">
                {React.createElement(isActivePath(nav.link) ? nav.activeIcon : nav.icon)}
              </button>
              <span className={cn('text-xs', { 'font-semibold': isActivePath(nav.link) })}>
                {nav.text}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BottomNav;
