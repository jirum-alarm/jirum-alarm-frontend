import React from 'react';
import {Text, View} from 'react-native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {UserLikeTarget} from '@/shared/api/gql/graphql';
import {ProductQueries} from '@/entities/product/product.queries';
import {ProductService} from '@/shared/api/product/product.service';
import PressableScale from '@/shared/components/PressableScale';
import {showToast} from '@/shared/lib/feedback';
import {cn} from '@/shared/lib/styling';

/**
 * 상품 추천 알약 버튼. web 은 이걸 ProductInfo 안(가격 우측)에 두지 하단 CTA 에
 * 두지 않는다 — 내가 처음에 하단으로 옮겼던 걸 web 위치로 되돌린 것.
 */
export default function RecommendButton({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const queryClient = useQueryClient();
  const {data: stats} = useQuery(ProductQueries.stats({id: productId}));

  const {mutate: toggle, isPending} = useMutation({
    mutationFn: (isLike: boolean | null) =>
      ProductService.addUserLikeOrDislike({
        target: UserLikeTarget.Product,
        targetId: productId,
        isLike,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ProductQueries.keys.stats(productId),
      }),
  });

  const isRecommended = !!stats?.isMyLike;

  const handlePress = () => {
    if (!isUserLogin) {
      showToast.info('로그인 후 이용해주세요.');
      return;
    }
    // ★ 해제는 false 가 아니라 null 이다(web 과 동일). false 는 "비추천"이라
    // 별개 의미라, 해제 대신 비추천이 눌린 것으로 기록된다.
    toggle(isRecommended ? null : true);
  };

  return (
    <PressableScale
      onPress={handlePress}
      disabled={isPending}
      accessibilityRole="button"
      accessibilityState={{selected: isRecommended}}
      accessibilityLabel={isRecommended ? '추천 완료' : '상품 추천'}>
      <View
        className={cn(
          'h-[36px] flex-row items-center justify-center gap-x-1 rounded-full border bg-white px-3.5',
          // web 은 선택됐을 때만 테두리에 색을 준다(기본은 border 만, 색 없음).
          // gray-200 을 상시로 두면 회색 링이 보여 눌린 상태와 구분이 흐려진다.
          isRecommended ? 'border-secondary-500' : 'border-gray-100',
        )}>
        <Text
          className={cn(
            'text-sm',
            isRecommended
              ? 'font-semibold text-secondary-700'
              : 'text-gray-700',
          )}>
          {isRecommended ? '추천 완료' : '상품 추천'}
        </Text>
        {typeof stats?.likeCount === 'number' && stats.likeCount > 0 ? (
          <Text
            className={cn(
              'text-sm',
              isRecommended ? 'text-secondary-700' : 'text-gray-700',
            )}>
            {stats.likeCount}
          </Text>
        ) : null}
        <Text className="text-sm">👍</Text>
      </View>
    </PressableScale>
  );
}
