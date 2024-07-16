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
  HOT = 'HOT',
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
    type: NAV_TYPE.HOT,
    link: '/',
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
        `fixed bottom-0 z-50 mx-auto w-full max-w-screen-md border-t border-t-[#D0D5DD] bg-white pb-safe-bottom transition-transform`,
      )}
    >
      <ul className="flex items-center justify-around">
        {BottomNavList.map((nav, i) => (
          <li className="flex-1" key={i}>
            <Link className="flex h-20 flex-col items-center justify-center" href={nav.link}>
              <button className="h-7 w-7">
                {React.createElement(type === nav.type ? nav.activeIcon : nav.icon)}
              </button>
              <span className="text-xs">{nav.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BottomNav;
