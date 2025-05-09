import { useMutation, useQueryClient } from '@tanstack/react-query';

import Button from '@/components/common/Button';
import { Thumbsup } from '@/components/common/icons';
import { ProductQueries } from '@/entities/product';
import useRedirectIfNotLoggedIn from '@/features/auth/useRedirectIfNotLoggedIn';
import { cn } from '@/lib/cn';
import { ProductQuery, UserLikeTarget } from '@/shared/api/gql/graphql';
import { LikeService } from '@/shared/api/like/like.service';

type Product = NonNullable<ProductQuery['product']>;

function RecommendButton({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const productKey = ProductQueries.product({ id: +product.id }).queryKey;

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
    if (product.isMyLike) {
      addUserLikeOrDislike({
        target: UserLikeTarget.Product,
        targetId: +product.id,
        isLike: null,
      });
    } else {
      addUserLikeOrDislike({
        target: UserLikeTarget.Product,
        targetId: +product.id,
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
            product.isMyLike !== null && product.isMyLike,
        },
      )}
      onClick={handleUserLikeClick}
    >
      <span>상품 추천</span>
      <Thumbsup width={18} height={18} fill="#F2F4F7" />
    </Button>
  );
}

export default RecommendButton;
