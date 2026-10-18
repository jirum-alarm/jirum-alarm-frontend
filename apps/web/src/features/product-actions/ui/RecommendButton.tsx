'use client';

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { UserLikeTarget } from '@/shared/api/gql/graphql';
import { LikeService } from '@/shared/api/like/like.service';
import useRedirectIfNotLoggedIn from '@/shared/hooks/useRedirectIfNotLoggedIn';
import { cn } from '@/shared/lib/cn';
import { PendingActionType, usePendingAction } from '@/shared/lib/pending-action';
import { triggerHaptic } from '@/shared/lib/webview';
import Button from '@/shared/ui/common/Button';
import { Thumbsup } from '@/shared/ui/common/icons';
import { useToast } from '@/shared/ui/common/Toast';

import { ProductQueries } from '@/entities/product';

export default function RecommendButton({ productId }: { productId: number }) {
  const { data: productStats } = useSuspenseQuery(ProductQueries.productStats({ id: productId }));
  const queryClient = useQueryClient();
  const productKey = ProductQueries.productStats({ id: productId }).queryKey;

  const { toast } = useToast();
  type Stats = typeof productStats;

  // 서버 응답을 기다리면 누른 뒤 한참 뒤에 바뀌어 반응이 없는 것처럼 보였다 — 누르는 즉시 바꾸고 실패하면 되돌린다.
  const { mutate: addUserLikeOrDislike, isPending } = useMutation({
    mutationFn: LikeService.addUserLikeOrDislike,
    onMutate: async ({ isLike }) => {
      await queryClient.cancelQueries({ queryKey: productKey });
      const prev = queryClient.getQueryData<Stats>(productKey);
      if (prev) {
        const wasLike = !!prev.isMyLike;
        const nowLike = !!isLike;
        queryClient.setQueryData<Stats>(productKey, {
          ...prev,
          isMyLike: nowLike,
          likeCount: prev.likeCount + (nowLike === wasLike ? 0 : nowLike ? 1 : -1),
        });
      }
      return { prev };
    },
    onError: (_e, _v, context) => {
      if (context?.prev) queryClient.setQueryData(productKey, context.prev);
      triggerHaptic('error');
      toast.error('추천하지 못했어요. 다시 시도해주세요.');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: productKey }),
  });
  const { checkAndRedirect } = useRedirectIfNotLoggedIn();

  // 로그인하고 돌아왔으면 누르려던 상품에 이어서 좋아요를 남긴다.
  // 로그인 전이라 좋아요가 없던 상태이므로 항상 isLike: true 다.
  usePendingAction<number>(PendingActionType.PRODUCT_LIKE, (id) => {
    if (id === productId) {
      addUserLikeOrDislike({
        target: UserLikeTarget.Product,
        targetId: productId,
        isLike: true,
      });
    }
  });

  const handleUserLikeClick = () => {
    if (checkAndRedirect(undefined, { type: PendingActionType.PRODUCT_LIKE, payload: productId }))
      return;
    if (isPending) return;
    triggerHaptic(productStats?.isMyLike ? 'light' : 'success');
    if (productStats?.isMyLike) {
      addUserLikeOrDislike({
        target: UserLikeTarget.Product,
        targetId: productId,
        isLike: null,
      });
    } else {
      addUserLikeOrDislike({
        target: UserLikeTarget.Product,
        targetId: productId,
        isLike: true,
      });
    }
  };
  return (
    <Button
      variant={'outlined'}
      color={'secondary'}
      className={cn(
        `flex h-9 items-center justify-center gap-x-1 rounded-full bg-white px-3.5 text-gray-700`,
        {
          'border-secondary-500 text-secondary-700 border font-semibold':
            productStats?.isMyLike !== null && productStats?.isMyLike,
        },
      )}
      onClick={handleUserLikeClick}
    >
      <span>{productStats?.isMyLike ? '추천 완료' : '상품 추천'}</span>
      {typeof productStats?.likeCount === 'number' && productStats.likeCount > 0 && (
        <span className="tabular-nums">{productStats.likeCount}</span>
      )}
      <Thumbsup width={18} height={18} fill="var(--color-gray-100)" />
    </Button>
  );
}
