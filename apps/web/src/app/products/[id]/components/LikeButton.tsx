'use client';

import { useState } from 'react';

import Button from '@/components/common/Button';
import { EVENT } from '@/constants/mixpanel';
import { PAGE } from '@/constants/page';
import { mp } from '@/components/Mixpanel';
import { ProductQuery } from '@/shared/api/gql/graphql';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductQueries } from '@/entities/product';
import { Heart } from '@/components/common/icons';
import { WishlistService } from '@/shared/api/wishlist/wishlist.service';
import { WishlistQueries } from '@/entities/wishlist';
import { useDevice } from '@/hooks/useDevice';
import { WebViewBridge, WebViewEventType } from '@/shared/lib/webview';
import useMyRouter from '@/hooks/useMyRouter';

export default function LikeButton({
  product,
  isUserLogin,
}: {
  product: NonNullable<ProductQuery['product']>;
  isUserLogin: boolean;
}) {
  const { isJirumAlarmApp } = useDevice();
  const [isLiked, setIsLiked] = useState(product.isMyWishlist);

  const productId = +product.id;

  const router = useMyRouter();

  const productKey = ProductQueries.product({ id: productId }).queryKey;
  const queryClient = useQueryClient();

  const { mutate: addWishlist } = useMutation({
    mutationFn: WishlistService.addWishlist,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: productKey,
        }),
        queryClient.invalidateQueries({
          queryKey: WishlistQueries.lists(),
        }),
      ]);
    },
  });
  const { mutate: removeWishlist } = useMutation({
    mutationFn: WishlistService.removeWishlist,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: productKey,
        }),
        queryClient.invalidateQueries({
          queryKey: WishlistQueries.lists(),
        }),
      ]);
    },
  });

  const handleClickWishlist = () => {
    if (!isUserLogin) {
      mp?.track(EVENT.PRODUCT_WISH.NAME, {
        type: EVENT.PRODUCT_WISH.TYPE.NOT_LOGGED_IN,
        page: EVENT.PAGE.DETAIL,
      });

      if (isJirumAlarmApp) {
        WebViewBridge.sendMessage(WebViewEventType.ROUTE_CHANGED, {
          data: { url: PAGE.LOGIN },
        });
      } else {
        router.push(PAGE.LOGIN);
      }

      return;
    }

    if (isLiked) {
      mp?.track(EVENT.PRODUCT_WISH.NAME, {
        type: EVENT.PRODUCT_WISH.TYPE.REMOVE,
        page: EVENT.PAGE.DETAIL,
      });

      removeWishlist({ productId });
      setIsLiked(false);

      return;
    }

    if (!isLiked) {
      mp?.track(EVENT.PRODUCT_WISH.NAME, {
        type: EVENT.PRODUCT_WISH.TYPE.ADD,
        page: EVENT.PAGE.DETAIL,
      });
      addWishlist({ productId });
      setIsLiked(true);

      return;
    }
  };

  return (
    <Button
      variant="outlined"
      onClick={handleClickWishlist}
      className="flex w-[56px] min-w-[56px] flex-col items-center justify-center border-gray-300 p-2"
    >
      <Heart isLiked={!!isLiked} />
      <span className="text-[11px] leading-4 text-gray-900">찜하기</span>
    </Button>
  );
}
