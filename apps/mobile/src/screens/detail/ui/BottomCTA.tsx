import React, {useCallback, useState} from 'react';
import {Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import * as Haptics from 'expo-haptics';

import {ProductQueries} from '@/entities/product/product.queries';
import {ProductService} from '@/shared/api/product/product.service';
import Button from '@/shared/components/ui/Button';
import Heart from '@/shared/components/icons/Heart';
import {MixpanelService} from '@/shared/lib/analytics/mixpanel';
import {showToast} from '@/shared/lib/feedback';
import {openInAppBrowser} from '@/shared/lib/navigation';
import {cn} from '@/shared/lib/styling';

import PressableScale from '@/shared/components/PressableScale';
import {
  usePendingAction,
  useRequireLogin,
} from '@/shared/hooks/useRequireLogin';
import {PendingActionType} from '@/shared/lib/pending-action';

import PostPurchaseKeywordPrompt from './PostPurchaseKeywordPrompt';
import TopButton from './TopButton';

import type {ProductDetail} from '../model/types';

/** iOS HIG 최소 터치 타깃. */
const MIN_TAP = 44;

export default function BottomCTA({
  product,
  isUserLogin,
  onPressTop,
  showTopButton,
}: {
  product: ProductDetail;
  isUserLogin: boolean;
  onPressTop?: () => void;
  /** 스크롤을 올리는 중일 때만 맨위로 버튼을 띄운다(web 과 동일). */
  showTopButton?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const [showKeywordPrompt, setShowKeywordPrompt] = useState(false);
  const queryClient = useQueryClient();
  const productId = Number(product.id);
  const {requireLogin} = useRequireLogin(`/products/${productId}`);

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
    onSuccess: (_data, next) => {
      invalidate();
      if (next) showToast.info('찜 목록에 추가되었어요.');
    },
  });

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

    // 구매 링크는 인앱 브라우저로 열려 유저는 이 화면에 남는다. 그 순간에만 권한다.
    setShowKeywordPrompt(true);
    openInAppBrowser(product.detailUrl);
  }, [
    product.detailUrl,
    product.id,
    product.isProfitUrl,
    product.profitLinkProvider,
  ]);

  const isWishlisted = !!stats?.isMyWishlist;
  const paddingBottom = Math.max(insets.bottom, 8);

  usePendingAction(PendingActionType.WISHLIST_ADD, () => {
    if (!isWishlisted) toggleWishlist(true);
  });

  return (
    <View className="border-t border-t-gray-300 bg-white">
      {onPressTop ? (
        <TopButton visible={!!showTopButton} onPress={onPressTop} />
      ) : null}
      <PostPurchaseKeywordPrompt
        show={showKeywordPrompt}
        title={product.title}
        productId={productId}
        isUserLogin={isUserLogin}
        onClose={() => setShowKeywordPrompt(false)}
      />
      <View
        className="flex-row items-center gap-x-3 px-5 pt-2"
        style={{paddingBottom}}>
        <PressableScale
          onPress={() => {
            if (requireLogin(PendingActionType.WISHLIST_ADD)) return;
            Haptics.impactAsync(
              isWishlisted
                ? Haptics.ImpactFeedbackStyle.Light
                : Haptics.ImpactFeedbackStyle.Medium,
            ).catch(() => {});
            MixpanelService.track('product_wish', {
              product_id: productId,
              wish_action: isWishlisted ? 'remove' : 'add',
            });
            toggleWishlist(!isWishlisted);
          }}
          disabled={isWishlistPending}
          style={{minWidth: MIN_TAP, minHeight: MIN_TAP}}
          className="items-center justify-center"
          accessibilityRole="button"
          accessibilityState={{selected: isWishlisted}}
          accessibilityLabel={isWishlisted ? '찜 해제' : '찜하기'}>
          <Heart liked={isWishlisted} width={24} height={24} />
          <Text
            className={cn(
              'text-[11px]',
              isWishlisted ? 'text-error-500' : 'text-gray-800',
            )}>
            찜하기
          </Text>
        </PressableScale>

        <Button
          className="h-[48px] flex-1"
          onPress={handlePurchase}
          disabled={!product.detailUrl}
          accessibilityRole="button"
          accessibilityLabel="구매하러 가기">
          <Text className="text-base font-semibold text-gray-900">
            구매하러 가기
          </Text>
        </Button>
      </View>
    </View>
  );
}
