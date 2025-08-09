'use client';

import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';

import Button from '@/components/common/Button';
import { Heart } from '@/components/common/icons';
import { useToast } from '@/components/common/Toast';
import { PAGE } from '@/constants/page';
import { ProductQueries } from '@/entities/product';
import { WishlistQueries } from '@/entities/wishlist';
import Link from '@/features/Link';
import { useDevice } from '@/hooks/useDevice';
import useMyRouter from '@/hooks/useMyRouter';
import { useFragment } from '@/shared/api/gql';
import { ProductStatsFragmentDoc } from '@/shared/api/gql/graphql';
import { WishlistService } from '@/shared/api/wishlist/wishlist.service';
import { WebViewBridge, WebViewEventType } from '@/shared/lib/webview';

export default function LikeButton({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const { toast } = useToast();

  const { data: product } = useSuspenseQuery(ProductQueries.productStats({ id: productId }));

  const { isJirumAlarmApp } = useDevice();
  const [isLiked, setIsLiked] = useState(product?.isMyWishlist ?? false);

  const router = useMyRouter();

  const productKey = ProductQueries.productStats({ id: productId }).queryKey;
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
      toast(<LikeToast />);
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
      className="flex flex-col items-center justify-center border-gray-300 p-2"
    >
      <Heart className="shrink-0" color="#98A2B3" isLiked={!!isLiked} />
      <span className="shrink-0 text-[11px] leading-4 text-gray-800">찜하기</span>
    </Button>
  );
}

const LikeToast = () => {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <p>찜 목록에 추가되었어요.</p>
      <Link href={PAGE.LIKE}>
        <Button size="sm" className="rounded-3xl" color="primary" variant="filled">
          보러가기
        </Button>
      </Link>
    </div>
  );
};
