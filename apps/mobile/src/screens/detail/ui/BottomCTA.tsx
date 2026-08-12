import React, {useCallback} from 'react';
import {Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {ProductQueries} from '@/entities/product/product.queries';
import {ProductService} from '@/shared/api/product/product.service';
import Button from '@/shared/components/ui/Button';
import {MixpanelService} from '@/shared/lib/analytics/mixpanel';
import {showToast} from '@/shared/lib/feedback';
import {openInAppBrowser} from '@/shared/lib/navigation';
import {cn} from '@/shared/lib/styling';

import type {ProductDetail} from '../model/types';

/** iOS HIG 최소 터치 타깃. */
const MIN_TAP = 44;

export default function BottomCTA({
  product,
  isUserLogin,
}: {
  product: ProductDetail;
  isUserLogin: boolean;
}) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const productId = Number(product.id);

  // 찜/추천 상태는 로그인 여부로 값이 바뀌므로 ProductInfo 와 캐시를 나눠 둔 stats 를 쓴다.
  const {data: stats} = useQuery(ProductQueries.stats({id: productId}));

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ProductQueries.keys.stats(productId),
    });

  const {mutate: toggleWishlist, isPending: isWishlistPending} = useMutation({
    mutationFn: (next: boolean) =>
      next
        ? ProductService.addWishlist({productId})
        : ProductService.removeWishlist({productId}),
    onSuccess: invalidate,
  });

  const requireLogin = () => {
    showToast.info('로그인 후 이용해주세요.');
  };

  const handlePurchase = useCallback(() => {
    if (!product.detailUrl) return;

    // web 은 GTM dataLayer 로 보낸다. RN 에는 GTM 이 없으므로 Mixpanel 로 대체 —
    // 그냥 지우면 구매 클릭 추적(수익 지표)이 사라진다.
    MixpanelService.track('purchase_link_click', {
      product_id: String(product.id),
      click_url: product.detailUrl,
      monetized: product.isProfitUrl ?? false,
      profit_provider: product.profitLinkProvider ?? null,
    });

    openInAppBrowser(product.detailUrl);
  }, [
    product.detailUrl,
    product.id,
    product.isProfitUrl,
    product.profitLinkProvider,
  ]);

  const isWishlisted = !!stats?.isMyWishlist;

  return (
    <View
      className="flex-row items-center gap-x-3 border-t border-t-gray-300 bg-white px-5 pt-2"
      style={{paddingBottom: Math.max(insets.bottom, 8)}}>
      <Pressable
        onPress={() =>
          isUserLogin ? toggleWishlist(!isWishlisted) : requireLogin()
        }
        disabled={isWishlistPending}
        style={{minWidth: MIN_TAP, minHeight: MIN_TAP}}
        className="items-center justify-center"
        accessibilityRole="button"
        accessibilityState={{selected: isWishlisted}}
        accessibilityLabel={isWishlisted ? '찜 해제' : '찜하기'}>
        <Text className="text-xl">{isWishlisted ? '♥' : '♡'}</Text>
        <Text
          className={cn(
            'text-[11px]',
            isWishlisted ? 'text-error-500' : 'text-gray-500',
          )}>
          찜하기
        </Text>
      </Pressable>

      <Button
        className="h-[48px] flex-1"
        onPress={handlePurchase}
        disabled={!product.detailUrl}
        accessibilityRole="button"
        accessibilityLabel="구매하러 가기">
        <Text className="text-base font-semibold text-white">
          구매하러 가기
        </Text>
      </Button>
    </View>
  );
}
