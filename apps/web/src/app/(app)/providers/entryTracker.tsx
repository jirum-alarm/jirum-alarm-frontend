'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { recordPathname } from '@/shared/lib/entry';

// 라우팅마다 경로를 기록해 상세의 구매 클릭이 직전 화면을 알 수 있게 한다.
export const EntryTracker = () => {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) recordPathname(pathname);
  }, [pathname]);
  return null;
};
