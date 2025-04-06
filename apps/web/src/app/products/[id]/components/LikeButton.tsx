'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import Button from '@/components/common/Button';
import { Heart } from '@/components/common/icons';
import { PAGE } from '@/constants/page';
import { ProductQueries } from '@/entities/product';
import { WishlistQueries } from '@/entities/wishlist';
import { useDevice } from '@/hooks/useDevice';
import useMyRouter from '@/hooks/useMyRouter';
import { ProductQuery } from '@/shared/api/gql/graphql';
import { WishlistService } from '@/shared/api/wishlist/wishlist.service';
import { WebViewBridge, WebViewEventType } from '@/shared/lib/webview';

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
      // TODO: Need GTM Migration
      // mp?.track(EVENT.PRODUCT_WISH.NAME, {
      //   type: EVENT.PRODUCT_WISH.TYPE.NOT_LOGGED_IN,
      //   page: EVENT.PAGE.DETAIL,
      // });

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
      // TODO: Need GTM Migration
      // mp?.track(EVENT.PRODUCT_WISH.NAME, {
      //   type: EVENT.PRODUCT_WISH.TYPE.REMOVE,
      //   page: EVENT.PAGE.DETAIL,
      // });

      removeWishlist({ productId });
      setIsLiked(false);

      return;
    }

    if (!isLiked) {
      // TODO: Need GTM Migration
      // mp?.track(EVENT.PRODUCT_WISH.NAME, {
      //   type: EVENT.PRODUCT_WISH.TYPE.ADD,
      //   page: EVENT.PAGE.DETAIL,
      // });
      addWishlist({ productId });
      setIsLiked(true);

      return;
    }
  };

  return (
    <Button
      variant="outlined"
      onClick={handleClickWishlist}
      className="flex w-[48px] flex-col items-center justify-center border-gray-300 p-2"
    >
      <Heart className="shrink-0" color="#98A2B3" isLiked={!!isLiked} />
      <span className="text-[11px] leading-4 text-gray-800">찜하기</span>
    </Button>
  );
}
