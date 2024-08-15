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
import { motion } from 'framer-motion';
import React, { startTransition, useEffect, useRef, useState } from 'react';

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

// 1. 링크를 기준으로 active
// 2. touch start나 mouse down으로 active 후 링크가 이동 안 됐으면 unactive

const BottomNav = ({ type }: { type: any }) => {
  // const [navType, setNavType] = useState<NAV_TYPE | undefined>(undefined);
  // const previousNavType = useRef<NAV_TYPE | undefined>(navType);

  const pathName = usePathname();
  const navRef = useRef<HTMLUListElement>(null);

  if (!BottomNavList.some((nav) => nav.link === pathName)) return;

  {
    /* @TODO: remove afeter v1.1.0 QA */
  }
  // if (IS_VERCEL_PRD) return;

  // const handleActiveNav = (type: NAV_TYPE) => () => {
  //   console.log('handleActiveNav');
  //   previousNavType.current = navType;
  //   setNavType(type);
  // };

  // const handleActiveNavCancel = () => {
  //   console.log('handleActiveNavCancel');
  //   setNavType(previousNavType.current);
  // };

  // const isActiveNav = (type: NAV_TYPE, link: string) => {
  //   return navType ? type === navType : link === pathName;
  // };
  const isActiveNav = (type: NAV_TYPE, link: string) => {
    return link === pathName;
  };

  return (
    <div
      className={cn(
        `fixed bottom-0 left-1/2 z-50 mx-auto w-full max-w-screen-layout-max -translate-x-1/2 border-t border-t-[#D0D5DD] bg-white pb-safe-bottom transition-transform`,
      )}
    >
      <ul className="flex items-center justify-around" ref={navRef}>
        {BottomNavList.map((nav, i) => (
          <li key={i} className="flex flex-1 items-center justify-center py-3">
            {/* <motion.div
              className="rounded-lg"
              whileTap={{ scale: 0.9, backgroundColor: '#F2F4F7' }}
              transition={{ backgroundColor: { duration: 0 } }} // 애니메이션 없이 즉각적인 배경색 변경
              onPointerDown={handleActiveNav(nav.type)}
              onPointerCancel={handleActiveNavCancel}
            > */}
            <Link
              data-nav-type={nav.type}
              className={cn(
                'flex h-[46px] w-[68px] flex-col items-center justify-center rounded-lg text-gray-500',
                {
                  'text-gray-900': isActiveNav(nav.type, nav.link),
                },
              )}
              href={nav.link}
            >
              <button className="h-7 w-7">
                {React.createElement(isActiveNav(nav.type, nav.link) ? nav.activeIcon : nav.icon)}
              </button>
              <span className={cn('text-xs', { 'font-semibold': isActiveNav(nav.type, nav.link) })}>
                {nav.text}
              </span>
            </Link>
            {/* </motion.div> */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BottomNav;
