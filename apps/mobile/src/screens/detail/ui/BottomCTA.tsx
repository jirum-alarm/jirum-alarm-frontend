import {patchProductStats} from '@/entities/product/optimistic-stats';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import * as Haptics from 'expo-haptics';

import {ProductQueries} from '@/entities/product/product.queries';
import {ProductService} from '@/shared/api/product/product.service';
import Button from '@/shared/components/ui/Button';
import Heart from '@/shared/components/icons/Heart';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {showToast} from '@/shared/lib/feedback';
import {openInAppBrowser} from '@/shared/lib/navigation';
import {cn} from '@/shared/lib/styling';

import PressableScale from '@/shared/components/PressableScale';
import {useReduceMotion} from '@/shared/hooks/useReduceMotion';
import {
  usePendingAction,
  useRequireLogin,
} from '@/shared/hooks/useRequireLogin';
import {PendingActionType} from '@/shared/lib/pending-action';

import {
  buildPostPurchasePromptQueue,
  hasJoinedOkachat,
  type PostPurchasePromptKind,
} from '../lib/okachat';
import PostPurchaseKakaoPrompt from './PostPurchaseKakaoPrompt';
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
  const bottomClip = useHiddenTabBarClipPadding();
  const [promptQueue, setPromptQueue] = useState<PostPurchasePromptKind[]>([]);
  const queryClient = useQueryClient();
  const productId = Number(product.id);
  const {requireLogin} = useRequireLogin(`/products/${productId}`);

  const phase = promptQueue[0] ?? null;
  const advancePrompt = () => setPromptQueue(q => q.slice(1));

  // 찜/추천 상태는 로그인 여부로 값이 바뀌므로 ProductInfo 와 캐시를 나눠 둔 stats 를 쓴다.
  const {data: stats} = useQuery(ProductQueries.stats({id: productId}));

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ProductQueries.keys.stats(productId),
    });

  // 하트는 누르는 즉시 바뀐다(낙관적) — 서버 왕복을 기다리지 않고, 실패하면 되돌린다.
  const {mutate: toggleWishlist} = useMutation({
    mutationFn: (next: boolean) =>
      next
        ? ProductService.addWishlist({productId})
        : ProductService.removeWishlist({productId}),
    onMutate: (next: boolean) =>
      patchProductStats(queryClient, productId, old => ({
        ...old,
        isMyWishlist: next,
      })),
    onSuccess: (_data, next) => {
      invalidate();
      if (next) showToast.success('찜 목록에 추가되었어요.', {haptic: false});
    },
    onError: (_err, _next, rollback) => {
      rollback?.();
      showToast.error('찜하지 못했어요. 다시 시도해주세요.');
    },
  });

  const handlePurchase = useCallback(async () => {
    if (!product.detailUrl) return;

    // web 은 GTM dataLayer 로 보낸다. RN 에는 GTM 이 없으므로 GA4(Firebase Analytics) 로 직접 보낸다 —
    // 그냥 지우면 구매 클릭 추적(수익 지표)이 사라진다.
    Analytics.track('purchase_link_click', {
      product_id: String(product.id),
      click_url: product.detailUrl,
      monetized: product.isProfitUrl ?? false,
      profit_provider: product.profitLinkProvider ?? null,
    });

    // 브라우저를 먼저 연다 — 저장소 읽기(await)를 앞에 두면 구매 탭이 한 박자 늦게 반응했다.
    // 돌아왔을 때 띄울 안내 순서는 브라우저가 떠 있는 동안 계산해도 충분하다.
    openInAppBrowser(product.detailUrl);
    const joined = await hasJoinedOkachat();
    setPromptQueue(buildPostPurchasePromptQueue(isUserLogin, joined));
  }, [
    product.detailUrl,
    product.id,
    product.isProfitUrl,
    product.profitLinkProvider,
    isUserLogin,
  ]);

  const isWishlisted = !!stats?.isMyWishlist;
  // 상세는 탭바를 숨긴다(2026-10-01) — CTA 가 화면 바닥이라 safe area 만 비운다.
  // (iOS 26 시스템 탭바를 다시 켜면 숨길 때 잘리는 높이만큼 clip 보정이 붙는다.)
  const paddingBottom = Math.max(insets.bottom, 12) + bottomClip;

  usePendingAction(PendingActionType.WISHLIST_ADD, () => {
    if (!isWishlisted) toggleWishlist(true);
  });

  return (
    <View className="border-t border-t-gray-300 bg-white">
      {onPressTop ? (
        <TopButton visible={!!showTopButton} onPress={onPressTop} />
      ) : null}
      <PostPurchaseKakaoPrompt
        show={phase === 'kakao'}
        onClose={advancePrompt}
      />
      <PostPurchaseKeywordPrompt
        show={phase === 'keyword'}
        title={product.title}
        productId={productId}
        isUserLogin={isUserLogin}
        onClose={advancePrompt}
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
            Analytics.track('product_wish', {
              product_id: productId,
              wish_action: isWishlisted ? 'remove' : 'add',
            });
            toggleWishlist(!isWishlisted);
          }}
          style={{minWidth: MIN_TAP, minHeight: MIN_TAP}}
          className="items-center justify-center"
          accessibilityRole="button"
          accessibilityState={{selected: isWishlisted}}
          accessibilityLabel={isWishlisted ? '찜 해제' : '찜하기'}>
          <HeartPop liked={isWishlisted} />
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

/**
 * 찜하면 하트가 한 번 톡 튄다(1 → 1.25 → 1) — 색만 바뀌면 눌렸는지 손끝에 안 남는다.
 * 해제는 조용히. "동작 줄이기" 사용자에겐 튀지 않는다.
 */
function HeartPop({liked}: {liked: boolean}) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduceMotion = useReduceMotion();
  const prev = useRef(liked);
  useEffect(() => {
    if (liked && !prev.current && !reduceMotion) {
      scale.setValue(0.8);
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        tension: 220,
        useNativeDriver: true,
      }).start();
    }
    prev.current = liked;
  }, [liked, reduceMotion, scale]);
  return (
    <Animated.View style={{transform: [{scale}]}}>
      <Heart liked={liked} width={24} height={24} />
    </Animated.View>
  );
}
