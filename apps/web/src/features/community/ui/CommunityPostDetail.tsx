'use client';

import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import Image from 'next/image';

import { CommunityService } from '@/shared/api/community/community.service';
import { cn } from '@/shared/lib/cn';
import { displayTime } from '@/shared/lib/utils/displayTime';
import { Eye, ThumbsupFill } from '@/shared/ui/common/icons';
import { useToast } from '@/shared/ui/common/Toast';
import Link from '@/shared/ui/Link';

import { AuthQueries } from '@/entities/auth';
import { CommunityQueries } from '@/entities/community';

import CommunityCommentSection from './CommunityCommentSection';
import PostMenu from './PostMenu';

export default function CommunityPostDetailClient({
  postId,
  isUserLogin,
}: {
  postId: number;
  isUserLogin: boolean;
}) {
  const { data } = useSuspenseQuery(CommunityQueries.post(postId));
  const { data: authData } = useQuery(AuthQueries.me());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: likePost } = useMutation({
    mutationFn: (isLike?: boolean) => CommunityService.likePost(postId, isLike),
    onMutate: (isLike) => {
      const key = CommunityQueries.post(postId).queryKey;
      const prev = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: any) => {
        if (!old?.comment) return old;
        const liked = isLike === true;
        return {
          ...old,
          comment: {
            ...old.comment,
            isMyLike: liked,
            likeCount: old.comment.likeCount + (liked ? 1 : -1),
          },
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(CommunityQueries.post(postId).queryKey, ctx.prev);
      toast('좋아요 처리에 실패했어요.');
    },
  });

  const post = data?.comment;
  if (!post) return null;

  const isMyPost = `${post.author?.id ?? ''}` === `${authData?.me?.id ?? '##'}`;
  const hasTaggedProduct = !!post.taggedProduct?.id && post.taggedProduct.id !== '0';

  return (
    <div className="flex flex-col pb-32">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4">
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
        {isUserLogin && (
          <div className="pc:block hidden">
            <PostMenu postId={postId} isMyPost={isMyPost} />
          </div>
        )}
      </div>

      {/* 제목 */}
      {post.title && <h1 className="px-5 pb-2 text-lg font-bold text-gray-900">{post.title}</h1>}

      {/* 본문 */}
      <p className="px-5 pb-4 text-base leading-relaxed text-gray-800">{post.content}</p>

      {/* 상품 태그 */}
      {hasTaggedProduct && post.taggedProduct && (
        <Link
          href={`/products/${post.taggedProduct.id}`}
          className="mx-5 mb-4 block rounded-2xl bg-[#F3F7FF] p-4 transition-transform hover:bg-[#e8effe] active:scale-[0.98] active:bg-[#e8effe]"
        >
          <span className="mb-3 inline-block rounded-full bg-[#dce8ff] px-2.5 py-0.5 text-xs font-medium text-[#4378f5]">
            태그한 상품
          </span>
          <div className="flex items-center gap-x-3">
            {post.taggedProduct.thumbnail && (
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-indigo-100">
                <Image
                  src={post.taggedProduct.thumbnail}
                  alt={post.taggedProduct.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-gray-900">
                {post.taggedProduct.title}
              </p>
              {post.taggedProduct.price && (
                <p className="mt-1.5 text-base font-bold text-gray-900">
                  {post.taggedProduct.price}
                </p>
              )}
            </div>
          </div>
        </Link>
      )}

      {/* 통계 + 추천 */}
      <div className="flex items-center justify-between border-y border-gray-100 px-5 py-3">
        <div className="flex items-center gap-x-3 text-sm text-gray-400">
          <span className="flex items-center gap-x-1">
            <ThumbsupFill className="h-4 w-4" aria-hidden />
            {post.likeCount}
          </span>
          <span className="flex items-center gap-x-1">
            <Eye className="h-4 w-4" width={16} height={16} aria-hidden />
            {post.viewCount}
          </span>
        </div>
        <button
          onClick={() => isUserLogin && likePost(post.isMyLike ? undefined : true)}
          className={cn(
            'flex items-center gap-x-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            'transition-transform active:scale-95',
            post.isMyLike
              ? 'border-primary-500 bg-primary-50 text-primary-500'
              : 'border-gray-200 text-gray-500 hover:border-gray-300',
            !isUserLogin && 'opacity-40',
          )}
        >
          <ThumbsupFill className="h-[18px] w-[18px]" active={!!post.isMyLike} aria-hidden />
          추천
        </button>
      </div>

      {/* 댓글 섹션 */}
      <CommunityCommentSection postId={postId} isUserLogin={isUserLogin} />
    </div>
  );
}
