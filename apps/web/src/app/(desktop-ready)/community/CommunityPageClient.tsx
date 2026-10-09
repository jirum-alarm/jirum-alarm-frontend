'use client';

import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { Suspense } from 'react';

function CommunityListSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-y-2 border-b border-gray-100 px-5 py-4">
          {/* 유저 정보 */}
          <div className="flex items-center gap-x-2">
            <Skeleton className="h-3.5 w-16 rounded" />
            <Skeleton className="h-3 w-10 rounded" />
          </div>
          {/* 본문 + 썸네일 */}
          <div className="flex items-start justify-between gap-x-3">
            <div className="flex flex-1 flex-col gap-y-1.5">
              <Skeleton className="h-3.5 w-3/4 rounded" />
              <Skeleton className="h-3 w-full rounded" />
            </div>
            {i % 3 === 0 && <Skeleton className="h-20 w-20 flex-shrink-0 rounded-lg" />}
          </div>
          {/* 통계 */}
          <div className="flex gap-x-3">
            <Skeleton className="h-3 w-8 rounded" />
            <Skeleton className="h-3 w-8 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

import { PAGE } from '@/shared/config/page';
import { Skeleton } from '@/shared/ui/common/Skeleton';

import { CommunityTab } from '@/entities/community';

import { CommunityList, TabBar } from '@/features/community';

interface Props {
  isUserLogin?: boolean;
  insertAfterIndex?: number;
  insertContent?: React.ReactNode;
}

export default function CommunityPageClient({
  isUserLogin,
  insertAfterIndex,
  insertContent,
}: Props) {
  const [tab, setTab] = useQueryState<CommunityTab>('tab', {
    defaultValue: 'all',
    parse: (value) => {
      if (value === 'all' || value === 'trending' || value === 'notice') return value;
      return 'all';
    },
    serialize: String,
    history: 'push',
    clearOnDefault: false,
  });

  return (
    <div>
      <div className="flex items-center justify-between pr-5">
        <TabBar activeTab={tab} onChange={setTab} />
        {isUserLogin && (
          <Link
            href={PAGE.COMMUNITY_WRITE}
            className="bg-primary-500 hover:bg-primary-600 text-fixed-900 hidden items-center gap-x-1 rounded-lg px-4 py-2 text-sm font-semibold transition-transform active:scale-95 md:flex"
          >
            <span className="text-base leading-none">+</span>
            글쓰기
          </Link>
        )}
      </div>
      <Suspense fallback={<CommunityListSkeleton />}>
        <CommunityList
          tab={tab}
          insertAfterIndex={insertAfterIndex}
          insertContent={insertContent}
        />
      </Suspense>
    </div>
  );
}
