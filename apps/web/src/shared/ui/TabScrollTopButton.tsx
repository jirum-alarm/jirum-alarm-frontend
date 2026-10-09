'use client';

import { useQuery } from '@tanstack/react-query';
import { m } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import { ArrowRight } from '@/shared/ui/common/icons';

import { AuthQueries } from '@/entities/auth';

import { isScrollTopTabPath } from './tab-scroll-top';

const SHOW_AFTER_PX = 320;
/** 글쓰기 FAB(약 44px) + 간격. */
const FAB_CLEARANCE = '3.5rem';

/**
 * 앱 탭 루트용 맨 위로 버튼.
 * 웹 BottomNav 안 TopButton 과 같은 알약 모양이되, 네이티브 탭바 높이(--bottom-nav-padding) 위에 붙는다.
 */
export default function TabScrollTopButton() {
  const pathName = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const { data: authData } = useQuery({
    ...AuthQueries.me(),
    enabled: isScrollTopTabPath(pathName) && pathName.startsWith(PAGE.COMMUNITY),
  });
  const hasWriteFab =
    isScrollTopTabPath(pathName) && pathName.startsWith(PAGE.COMMUNITY) && !!authData?.me;

  useEffect(() => {
    if (!isScrollTopTabPath(pathName)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 스크롤 위치(외부 상태) 구독 effect 다. 탭 밖으로 나가면 구독을 끊으며 표시 상태도 접는다.
      setIsVisible(false);
      return;
    }

    const onScroll = () => {
      setIsVisible(window.scrollY > SHOW_AFTER_PX);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathName]);

  if (!isScrollTopTabPath(pathName)) return null;

  return (
    <m.button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="맨 위로"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={cn(
        'shadow-card fixed right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white transition-[opacity,transform] duration-200',
        isVisible ? 'opacity-100' : 'pointer-events-none translate-y-1 opacity-0',
      )}
      style={{
        bottom: hasWriteFab
          ? `calc(var(--bottom-fab-gap, 1rem) + var(--bottom-fab-padding, var(--bottom-nav-padding, 0px)) + ${FAB_CLEARANCE})`
          : 'calc(var(--bottom-fab-gap, 1rem) + var(--bottom-fab-padding, var(--bottom-nav-padding, 0px)))',
      }}
      whileTap={isVisible ? { scale: 0.95 } : undefined}
      transition={{ duration: 0.1 }}
    >
      <ArrowRight color="var(--color-gray-600)" className="-rotate-90" />
    </m.button>
  );
}
