'use client';

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { WishlistService } from '@/shared/api/wishlist/wishlist.service';
import { PAGE } from '@/shared/config/page';
import { useDevice } from '@/shared/hooks/useDevice';
import useIsLoggedIn from '@/shared/hooks/useIsLoggedIn';
import useMyRouter from '@/shared/hooks/useMyRouter';
import useRedirectIfNotLoggedIn from '@/shared/hooks/useRedirectIfNotLoggedIn';
import { PendingActionType, usePendingAction } from '@/shared/lib/pending-action';
import { triggerHaptic, WebViewBridge, WebViewEventType } from '@/shared/lib/webview';
import Button from '@/shared/ui/common/Button';
import { Heart } from '@/shared/ui/common/icons';
import { useToast } from '@/shared/ui/common/Toast';
import Link from '@/shared/ui/Link';

import { ProductQueries } from '@/entities/product';
import { WishlistQueries } from '@/entities/wishlist';

export default function LikeButton({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const { toast } = useToast();

  const { checkAndRedirect } = useRedirectIfNotLoggedIn();
  const { isLoggedIn } = useIsLoggedIn();
  const { data: product } = useSuspenseQuery(ProductQueries.productStats({ id: productId }));

  const { device } = useDevice();
  const [isLiked, setIsLiked] = useState(product?.isMyWishlist ?? false);

  const router = useMyRouter();

  const productKey = ProductQueries.productStats({ id: productId }).queryKey;
  const queryClient = useQueryClient();

  const { mutate: addWishlist } = useMutation({
    mutationFn: WishlistService.addWishlist,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKey }),
        queryClient.invalidateQueries({ queryKey: WishlistQueries.lists() }),
      ]);
      toast(<LikeToast />);
    },
  });
  const { mutate: removeWishlist } = useMutation({
    mutationFn: WishlistService.removeWishlist,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKey }),
        queryClient.invalidateQueries({ queryKey: WishlistQueries.lists() }),
      ]);
    },
  });

  // 게이트를 통과한 뒤의 실제 찜 토글. 클릭과 "로그인 후 이어하기" 양쪽이 쓴다.
  const runToggleWishlist = (liked: boolean) => {
    triggerHaptic(liked ? 'light' : 'success');

    if (typeof window !== 'undefined') {
      (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
        event: 'product_wish',
        product_id: productId,
        wish_action: liked ? 'remove' : 'add',
      });
    }

    if (liked) {
      removeWishlist({ productId });
      setIsLiked(false);
      return;
    }
    addWishlist({ productId });
    setIsLiked(true);
  };

  // 로그인하고 돌아왔으면 누르려던 상품을 이어서 찜한다.
  // 로그인 전이라 그 상품은 찜 안 된 상태였으므로 항상 '추가'다.
  usePendingAction<number>(PendingActionType.WISHLIST_ADD, (id) => {
    if (id === productId) runToggleWishlist(false);
  });

  const handleClickWishlist = () => {
    // 비로그인 유저가 찜을 누르면 로그인 게이트로 막혀 product_wish에 도달하지 못한다.
    // 게이트 직전에 wishlist_intent를 쏴서 "막힌 찜 수요"를 측정한다. (Phase 1 익명→회원 전환)
    if (!isLoggedIn && typeof window !== 'undefined') {
      (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
        event: 'wishlist_intent',
        product_id: productId,
      });
    }

    if (
      checkAndRedirect(
        {
          title: '찜하려면 로그인이 필요해요',
          description: '로그인하고 찜한 상품을 마이페이지에서 모아보세요',
        },
        { type: PendingActionType.WISHLIST_ADD, payload: productId },
      )
    )
      return;

    runToggleWishlist(isLiked);
  };

  return (
    <Button
      variant="outlined"
      onClick={handleClickWishlist}
      className="pc:w-15 flex size-12 flex-col items-center justify-center border-gray-300 px-0"
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
