'use client';

import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { CommunityService } from '@/shared/api/community/community.service';
import { cn } from '@/shared/lib/cn';
import { displayTime } from '@/shared/lib/utils/displayTime';
import { Eye, ThumbsupFill } from '@/shared/ui/common/icons';
import { useToast } from '@/shared/ui/common/Toast';
import Link from '@/shared/ui/Link';

import { AuthQueries } from '@/entities/auth';
import { CommunityQueries } from '@/entities/community';
import ProductThumbnail from '@/entities/product-list/ui/card/ProductThumbnail';

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
    <div className="flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-x-2">
          {post.isNotice && (
            <span className="bg-surface-brand text-fg-inverse rounded px-1.5 py-0.5 text-xs font-semibold">
              지름알림
            </span>
          )}
          <span className="typography-body-14m text-fg-secondary-strong">
            {post.author?.nickname ?? '알 수 없음'}
          </span>
          <span className="text-fg-tertiary text-xs">{displayTime(post.createdAt)}</span>
        </div>
        {isUserLogin && (
          <div className="pc:block hidden">
            <PostMenu postId={postId} isMyPost={isMyPost} />
          </div>
        )}
      </div>

      {/* 제목 */}
      {post.title && (
        <h1 className="typography-title-18b text-fg-primary px-5 pb-2">{post.title}</h1>
      )}

      {/* 본문 */}
      <p className="text-fg-strong px-5 pb-4 text-base leading-relaxed">{post.content}</p>

      {/* 상품 태그 */}
      {hasTaggedProduct && post.taggedProduct && (
        <Link
          href={`/products/${post.taggedProduct.id}`}
          className="bg-secondary-50 mx-5 mb-4 block rounded-2xl p-4 transition-transform hover:bg-[#e8effe] active:scale-[0.98] active:bg-[#e8effe]"
        >
          <span className="typography-caption-12m mb-3 inline-block rounded-full bg-[#dce8ff] px-2.5 py-0.5 text-[#4378f5]">
            태그한 상품
          </span>
          <div className="flex items-center gap-x-3">
            {post.taggedProduct.thumbnail && (
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-indigo-100">
                <ProductThumbnail
                  src={post.taggedProduct.thumbnail}
                  alt={post.taggedProduct.title}
                  title={post.taggedProduct.title}
                  type="product"
                  sizes="80px"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="typography-body-14m text-fg-primary line-clamp-2">
                {post.taggedProduct.title}
              </p>
              {post.taggedProduct.price && (
                <p className="text-fg-primary mt-1.5 text-base font-bold">
                  {post.taggedProduct.price}
                </p>
              )}
            </div>
          </div>
        </Link>
      )}

      {/* 통계 + 추천 */}
      <div className="border-border-subtle flex items-center justify-between border-y px-5 py-3">
        <div className="text-fg-tertiary typography-body-14r flex items-center gap-x-3">
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
            'typography-body-14m flex items-center gap-x-2 rounded-full border px-4 py-1.5 transition-colors',
            'transition-transform active:scale-95',
            post.isMyLike
              ? 'border-border-brand bg-primary-50 text-primary-500'
              : 'border-border-default hover:border-border-strong text-fg-secondary',
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
