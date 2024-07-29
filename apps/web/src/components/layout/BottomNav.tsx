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
import { PAGE } from '@/constants/page';
import { cn } from '@/lib/cn';
import Link from 'next/link';
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

const BottomNav = ({ type }: { type: NAV_TYPE }) => {
  return (
    <div
      className={cn(
        `fixed bottom-0 z-50 mx-auto w-full max-w-[600px] border-t border-t-[#D0D5DD] bg-white pb-safe-bottom transition-transform`,
      )}
    >
      <ul className="flex items-center justify-around">
        {BottomNavList.map((nav, i) => (
          <li className="flex flex-1 items-center justify-center pb-[22px] pt-3" key={i}>
            <Link
              className={cn(
                // px-5
                'flex h-[46px] w-[68px] flex-col items-center justify-center rounded-lg text-gray-500',
                {
                  'text-gray-900': type === nav.type,
                },
              )}
              href={nav.link}
            >
              <button className="h-7 w-7">
                {React.createElement(type === nav.type ? nav.activeIcon : nav.icon)}
              </button>
              <span className={cn('text-xs', { 'font-semibold': type === nav.type })}>
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
