import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache, Suspense } from 'react';

import { checkDevice } from '@/app/actions/agent';
import { getAccessToken } from '@/app/actions/token';

import { CommunityService } from '@/shared/api/community/community.service';
import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { Skeleton } from '@/shared/ui/common/Skeleton';
import BasicLayout from '@/shared/ui/layout/BasicLayout';

import { getPostDisplayContent, getPostImages } from '@/features/community/lib/postContent';
import CommunityPostDetailClient from '@/features/community/ui/CommunityPostDetail';
import CommunityPostPageHeader from '@/features/community/ui/CommunityPostPageHeader';
import { toSeoImageUrl } from '@/features/product-detail/lib/product-seo';

// generateMetadata에서 글 정보를 한 번만 조회하도록 캐싱
const getCommunityPostCached = cache((id: number) => CommunityService.getCommunityPost(id));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const data = await getCommunityPostCached(Number(id)).catch(() => null);
  const post = data?.comment;

  if (!post) {
    return { title: '게시글을 찾을 수 없습니다 | 지름알림' };
  }

  const displayContent = getPostDisplayContent(post.content);
  const postImages = getPostImages(post.content);
  const rawTitle = post.title?.trim() || displayContent.trim().slice(0, 30) || '커뮤니티 게시글';
  const title = `${rawTitle} | 지름알림 커뮤니티`;
  const description =
    displayContent.replace(/\s+/g, ' ').trim().slice(0, 100) ||
    '지름알림 커뮤니티에서 핫딜 정보를 나눠보세요.';
  const url = `${METADATA_SERVICE_URL}/community/${id}`;
  // 우리 CDN 은 webp 만 있어 원본 확장자(.jpg)는 403 이다 — 상품 상세와 같은 변환을 건다.
  const ogImage =
    toSeoImageUrl(post.taggedProduct?.thumbnail || postImages[0]) ??
    `${METADATA_SERVICE_URL}/opengraph-image.webp`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: '지름알림',
      locale: 'ko_KR',
      type: 'article',
      images: [{ url: ogImage, alt: rawTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage,
    },
    alternates: {
      canonical: url,
    },
  };
}

function PostDetailSkeleton() {
  return (
    <div className="flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-x-2 px-5 py-4">
        <Skeleton className="h-3.5 w-16 rounded" />
        <Skeleton className="h-3 w-10 rounded" />
      </div>
      {/* 제목 */}
      <Skeleton className="mx-5 mb-2 h-5 w-3/4 rounded" />
      {/* 본문 */}
      <div className="mx-5 mb-1 flex flex-col gap-y-2">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>
      {/* 태그 상품 */}
      <div className="bg-secondary-50 mx-5 mt-2 mb-4 rounded-2xl p-4">
        <Skeleton className="bg-secondary-100 mb-3 h-5 w-16 rounded-full" />
        <div className="flex items-center gap-x-3">
          <Skeleton className="bg-secondary-100 h-20 w-20 flex-shrink-0 rounded-xl" />
          <div className="flex flex-1 flex-col gap-y-2">
            <Skeleton className="bg-secondary-100 h-3.5 w-full rounded" />
            <Skeleton className="bg-secondary-100 h-3.5 w-2/3 rounded" />
            <Skeleton className="bg-secondary-100 h-4 w-1/3 rounded" />
          </div>
        </div>
      </div>
      {/* 통계 바 */}
      <div className="flex items-center justify-between border-y border-gray-100 px-5 py-3">
        <div className="flex gap-x-3">
          <Skeleton className="h-3.5 w-8 rounded" />
          <Skeleton className="h-3.5 w-8 rounded" />
        </div>
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
      {/* 댓글 */}
      <div className="mt-4 px-5">
        <Skeleton className="mb-3 h-4 w-10 rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-y-1.5 border-b border-gray-100 py-3">
            <div className="flex items-center gap-x-2">
              <Skeleton className="h-3.5 w-14 rounded" />
              <Skeleton className="h-3 w-8 rounded" />
            </div>
            <Skeleton className="h-3.5 w-full rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 없는 글은 soft 404(200+스켈레톤) 대신 진짜 404. generateMetadata와 cache 공유라 재조회 없음.
  const data = await getCommunityPostCached(Number(id)).catch(() => null);
  if (!data?.comment) {
    notFound();
  }

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
