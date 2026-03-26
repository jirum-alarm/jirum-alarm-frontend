import { Suspense } from 'react';

import { checkDevice } from '@/app/actions/agent';
import { getAccessToken } from '@/app/actions/token';

import BasicLayout from '@/shared/ui/layout/BasicLayout';

import CommunityPostDetailClient from '@/features/community/ui/CommunityPostDetail';
import CommunityPostPageHeader from '@/features/community/ui/CommunityPostPageHeader';

function PostDetailSkeleton() {
  return (
    <div className="flex flex-col pb-32">
      {/* 헤더 */}
      <div className="flex items-center gap-x-2 px-5 py-4">
        <div className="h-3.5 w-16 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-10 animate-pulse rounded bg-gray-100" />
      </div>
      {/* 제목 */}
      <div className="mx-5 mb-2 h-5 w-3/4 animate-pulse rounded bg-gray-100" />
      {/* 본문 */}
      <div className="mx-5 mb-1 flex flex-col gap-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
      </div>
      {/* 태그 상품 */}
      <div className="mx-5 mt-2 mb-4 rounded-2xl bg-[#F3F7FF] p-4">
        <div className="mb-3 h-5 w-16 animate-pulse rounded-full bg-[#dce8ff]" />
        <div className="flex items-center gap-x-3">
          <div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-xl bg-[#dce8ff]" />
          <div className="flex flex-1 flex-col gap-y-2">
            <div className="h-3.5 w-full animate-pulse rounded bg-[#dce8ff]" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-[#dce8ff]" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-[#dce8ff]" />
          </div>
        </div>
      </div>
      {/* 통계 바 */}
      <div className="flex items-center justify-between border-y border-gray-100 px-5 py-3">
        <div className="flex gap-x-3">
          <div className="h-3.5 w-8 animate-pulse rounded bg-gray-100" />
          <div className="h-3.5 w-8 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-8 w-16 animate-pulse rounded-full bg-gray-100" />
      </div>
      {/* 댓글 */}
      <div className="mt-4 px-5">
        <div className="mb-3 h-4 w-10 animate-pulse rounded bg-gray-100" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-y-1.5 border-b border-gray-100 py-3">
            <div className="flex items-center gap-x-2">
              <div className="h-3.5 w-14 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-8 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="h-3.5 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { isMobile } = await checkDevice();
  const token = await getAccessToken();
  const isUserLogin = !!token;

  if (isMobile) {
    return (
      <BasicLayout
        hasBackButton
        header={<CommunityPostPageHeader postId={Number(id)} isUserLogin={isUserLogin} />}
      >
        <Suspense fallback={<PostDetailSkeleton />}>
          <CommunityPostDetailClient postId={Number(id)} isUserLogin={isUserLogin} />
        </Suspense>
      </BasicLayout>
    );
  }

  return (
    <div className="max-w-2xl py-8">
      <Suspense fallback={<PostDetailSkeleton />}>
        <CommunityPostDetailClient postId={Number(id)} isUserLogin={isUserLogin} />
      </Suspense>
    </div>
  );
}
