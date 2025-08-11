'use client';

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import Button from '@/components/common/Button';
import { Thumbsup } from '@/components/common/icons';
import { cn } from '@/lib/cn';

import { UserLikeTarget } from '@shared/api/gql/graphql';
import { LikeService } from '@shared/api/like/like.service';
import useRedirectIfNotLoggedIn from '@shared/hooks/useRedirectIfNotLoggedIn';

import { ProductQueries } from '@entities/product';

export default function RecommendButton({ productId }: { productId: number }) {
  const { data: productStats } = useSuspenseQuery(ProductQueries.productStats({ id: productId }));
  const queryClient = useQueryClient();
  const productKey = ProductQueries.productStats({ id: productId }).queryKey;

  const { mutate: addUserLikeOrDislike } = useMutation({
    mutationFn: LikeService.addUserLikeOrDislike,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: productKey,
      }),
  });
  const { checkAndRedirect } = useRedirectIfNotLoggedIn();

  const handleUserLikeClick = () => {
    if (checkAndRedirect()) return;
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
        `flex h-[36px] items-center justify-center gap-x-1 rounded-full bg-white px-3.5 text-gray-700`,
        {
          'border border-secondary-500 font-semibold text-secondary-700':
            productStats?.isMyLike !== null && productStats?.isMyLike,
        },
      )}
      onClick={handleUserLikeClick}
    >
      <span>{productStats?.isMyLike ? '추천 완료' : '상품 추천'}</span>
      <Thumbsup width={18} height={18} fill="#F2F4F7" />
    </Button>
  );
}
