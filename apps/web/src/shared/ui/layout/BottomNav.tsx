'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { createElement, useEffect, useRef } from 'react';

import { PAGE } from '@/shared/config/page';
import { isTabRootPath } from '@/shared/config/tab-root';
import { useDevice } from '@/shared/hooks/useDevice';
import useIsLoggedIn from '@/shared/hooks/useIsLoggedIn';
import { useHeaderVisibility } from '@/shared/hooks/useScrollDirection';
import { getUnreadCountAfterLastRead, setUnreadCountSnapshot } from '@/shared/lib/alarmReadState';
import { cn } from '@/shared/lib/cn';
import { WebViewBridge } from '@/shared/lib/webview/sender';
import { WebViewEventType } from '@/shared/lib/webview/type';
import {
  Alert,
  AlertFill,
  BubbleChat,
  BubbleChatFill,
  Find,
  FindFill,
  Home,
  HomeFill,
  My,
  MyFill,
} from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

import { NotificationQueries } from '@/entities/notification';

import TabScrollTopButton from '../TabScrollTopButton';
import TopButton from '../TopButton';

export enum NAV_TYPE {
  HOME = 'HOME',
  TRENDING = 'TRENDING',
  COMMUNITY = 'COMMUNITY',
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
    type: NAV_TYPE.COMMUNITY,
    link: PAGE.COMMUNITY,
    text: '커뮤니티',
    icon: BubbleChat,
    activeIcon: BubbleChatFill,
    isActive: (pathName: string) => pathName.startsWith(PAGE.COMMUNITY),
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

function useHasNewAlarm() {
  const pathName = usePathname();
  const { isLoggedIn } = useIsLoggedIn();
  const { data: unreadCount } = useQuery({
    ...NotificationQueries.unreadCount(),
    enabled: isLoggedIn,
  });

  const isOnAlarmPage = pathName.startsWith(PAGE.ALARM);

  useEffect(() => {
    if (isOnAlarmPage && unreadCount !== undefined) {
      setUnreadCountSnapshot(unreadCount);
    }
  }, [isOnAlarmPage, unreadCount]);

  let hasNewAlarm = false;
  if (!isOnAlarmPage) {
    const storedCount = getUnreadCountAfterLastRead();
    hasNewAlarm = storedCount === -1 ? (unreadCount ?? 0) > 0 : (unreadCount ?? 0) > storedCount;
  }

  useEffect(() => {
    WebViewBridge.sendMessage(WebViewEventType.ALARM_DOT_CHANGED, {
      data: { hasNewAlarm },
    });
  }, [hasNewAlarm]);

  return hasNewAlarm;
}

const BottomNavComponent = () => {
  const pathName = usePathname();
  const navRef = useRef<HTMLUListElement>(null);
  // 홈 예외(항상 노출)는 24ac472c 에서 "네비가 안 올라오는 현상" 우회로 들어갔던
  // 잔재다. 진짜 원인은 같은 커밋이 함께 고친 transform 충돌(-translate-x-1/2 가
  // translate-y 를 덮어씀)이라 예외는 더 필요 없다 — 모든 탭 루트에서 동일하게 숨긴다.
  const isBottomNavVisible = useHeaderVisibility();
  const hasNewAlarm = useHasNewAlarm();

  // data-bottom-nav 는 root layout 이 서버에서 심는다 — 여기서 useLayoutEffect 로
  // 붙이면 SSR 첫 페인트가 여백 0 으로 그려진 뒤 56px 밀린다.

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
      <TopButton
        className={pathName.startsWith(PAGE.COMMUNITY) ? '-top-[108px] right-5' : undefined}
      />
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
                  className="relative flex h-[36px] w-[48px] items-center justify-center"
                  aria-hidden="true"
                >
                  {createElement(isActiveNav(nav) ? nav.activeIcon : nav.icon)}
                  {nav.type === NAV_TYPE.ALARM && hasNewAlarm && (
                    <span className="absolute top-1 right-2.5 h-2 w-2 rounded-full bg-[#EB001C]" />
                  )}
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
  } = useDevice();
  const pathName = usePathname();

  // 앱은 네이티브 탭바를 같은 6개 경로에서 띄운다 → 웹 네비까지 그리면 두 겹으로 쌓인다.
  // device 는 root layout 이 서버 UA 판정 결과를 atom 에 심어주므로 첫 렌더부터
  // 정답이다 — 예전엔 useEffect 2단(useIsHydrated → setDevice)을 거치느라
  // 앱에서도 웹 네비가 한 프레임 떴다 사라졌다.
  if (isJirumAlarmApp) return <TabScrollTopButton />;

  if (!isTabRootPath(pathName)) return null;
  return <BottomNavComponent />;
}
