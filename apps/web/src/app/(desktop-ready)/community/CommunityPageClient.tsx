'use client';

import { Suspense, useState } from 'react';

function CommunityListSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-y-2 border-b border-gray-100 px-5 py-4">
          {/* 유저 정보 */}
          <div className="flex items-center gap-x-2">
            <div className="h-3.5 w-16 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-10 animate-pulse rounded bg-gray-100" />
          </div>
          {/* 본문 + 썸네일 */}
          <div className="flex items-start justify-between gap-x-3">
            <div className="flex flex-1 flex-col gap-y-1.5">
              <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
            </div>
            {i % 3 === 0 && (
              <div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-lg bg-gray-100" />
            )}
          </div>
          {/* 통계 */}
          <div className="flex gap-x-3">
            <div className="h-3 w-8 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-8 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
import Link from 'next/link';

import { PAGE } from '@/shared/config/page';

import { CommunityTab } from '@/entities/community';

import { CommunityList, TabBar } from '@/features/community';

export default function CommunityPageClient({ isUserLogin }: { isUserLogin?: boolean }) {
  const [tab, setTab] = useState<CommunityTab>('all');

  return (
    <div>
      <div className="flex items-center justify-between pr-5">
        <TabBar activeTab={tab} onChange={setTab} />
        {isUserLogin && (
          <Link
            href={PAGE.COMMUNITY_WRITE}
            className="bg-primary-500 hover:bg-primary-600 hidden items-center gap-x-1 rounded-lg px-4 py-2 text-sm font-semibold text-white md:flex"
          >
            <span className="text-base leading-none">+</span>
            글쓰기
          </Link>
        )}
      </div>
      <Suspense fallback={<CommunityListSkeleton />}>
        <CommunityList tab={tab} />
      </Suspense>
    </div>
  );
}
