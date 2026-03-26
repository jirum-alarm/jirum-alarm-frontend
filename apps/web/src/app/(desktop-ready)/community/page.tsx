import { Suspense } from 'react';

import { checkDevice } from '@/app/actions/agent';
import { getAccessToken } from '@/app/actions/token';

import BasicLayout from '@/shared/ui/layout/BasicLayout';
import { NAV_TYPE } from '@/shared/ui/layout/BottomNav';

import { CommunityHotDeals } from '@/features/community';

import CommunityDesktopSidebar from './CommunityDesktopSidebar';
import CommunityPageClient from './CommunityPageClient';

export default async function CommunityPage() {
  const { isMobile } = await checkDevice();
  const token = await getAccessToken();
  const isUserLogin = !!token;

  if (isMobile) {
    return (
      <BasicLayout
        hasBottomNav
        navType={NAV_TYPE.COMMUNITY}
        header={
          <header className="max-w-mobile-max fixed top-0 z-50 flex h-14 w-full items-center gap-x-2 border-b border-gray-100 bg-white px-5">
            <h1 className="text-lg font-bold text-gray-900">커뮤니티</h1>
          </header>
        }
      >
        <CommunityPageClient isUserLogin={isUserLogin} />
        <CommunityHotDeals />
      </BasicLayout>
    );
  }

  return (
    <div className="flex gap-x-8 py-8">
      {/* 좌: 커뮤니티 목록 */}
      <div className="min-w-0 flex-1">
        <h1 className="px-5 pb-2 text-xl font-bold text-gray-900">커뮤니티</h1>
        <CommunityPageClient isUserLogin={isUserLogin} />
      </div>

      {/* 우: 인기 핫딜 사이드바 (LG+) */}
      <aside className="hidden w-72 flex-shrink-0 lg:block">
        <Suspense fallback={null}>
          <CommunityDesktopSidebar />
        </Suspense>
      </aside>
    </div>
  );
}
