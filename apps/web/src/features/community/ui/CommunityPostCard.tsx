'use client';

import Image from 'next/image';
import Link from 'next/link';

import { CommunityPostsQuery } from '@/shared/api/community/community.service';
import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import { displayTime } from '@/shared/lib/utils/displayTime';
import { Eye, ThumbsupFill } from '@/shared/ui/common/icons';

import { CommunityTab } from '@/entities/community';

type Post = CommunityPostsQuery['comments'][number];

export default function CommunityPostCard({ post, tab }: { post: Post; tab: CommunityTab }) {
  const isProductComment = !post.title && !!post.productId;
  const hasTaggedProduct = !!post.taggedProduct?.id && post.taggedProduct.id !== '0';

  return (
    <Link
      href={{ pathname: `${PAGE.COMMUNITY}/${post.id}`, query: { tab } }}
      className="flex flex-col border-b border-gray-100 px-5 py-4 transition-transform hover:bg-gray-50 active:scale-[0.98] active:bg-gray-50"
    >
      {/* 헤더: 유저 정보 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          {post.isNotice && (
            <span className="bg-primary-500 rounded px-1.5 py-0.5 text-xs font-semibold text-white">
              지름알림
            </span>
          )}
          <span className="text-sm font-medium text-gray-700">
            {post.author?.nickname ?? '알 수 없음'}
          </span>
          <span className="text-xs text-gray-400">{displayTime(post.createdAt)}</span>
        </div>
        {post.isNotice && (
          <span className="bg-secondary-500 rounded px-1.5 py-0.5 text-xs font-semibold text-white">
            NEW
          </span>
        )}
      </div>

      {/* 본문 */}
      <div className="mt-2 flex items-start justify-between gap-x-3">
        <div className="min-w-0 flex-1">
          {/* 게시글: 제목 + 본문 / 상품 댓글: 본문만 */}
          {post.title && (
            <p className="truncate text-sm font-semibold text-gray-900">{post.title}</p>
          )}
          <p className={cn('text-sm text-gray-600', post.title ? 'truncate' : 'line-clamp-2')}>
            {post.content}
          </p>
        </div>

        {/* 상품 썸네일 */}
        {hasTaggedProduct && post.taggedProduct.thumbnail && (
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={post.taggedProduct.thumbnail}
              alt={post.taggedProduct.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        )}
      </div>

      {/* 하단: 상품명 (상품 댓글인 경우) */}
      {hasTaggedProduct && (
        <p className="mt-1.5 truncate text-xs text-gray-400">
          상품 보기 · {post.taggedProduct.title}
        </p>
      )}

      {/* 통계 */}
      <div className="mt-2 flex items-center gap-x-3 text-xs text-gray-400">
        <span className="flex items-center gap-x-1">
          <ThumbsupFill className="h-3.5 w-3.5" aria-hidden />
          {post.likeCount}
        </span>
        <span className="flex items-center gap-x-1">
          <Eye className="h-3.5 w-3.5" width={14} height={14} aria-hidden />
          {post.viewCount}
        </span>
      </div>
    </Link>
  );
}
