import React, {useEffect} from 'react';
import {View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

import type {ProductPriceVerdictQuery} from '@/shared/api/gql/graphql';
import {ProductService} from '@/shared/api/product/product.service';

export type PriceContext = NonNullable<
  NonNullable<ProductPriceVerdictQuery['product']>['priceContext']
>;

/**
 * 다나와 최저가 대비 배지. web `features/product-detail/ui/PriceContextBadge.tsx` 이식.
 * 서버 priceContext 가 게이트를 통과했을 때만 값이 온다 → 있으면 표시만(게이트 재구현 금지).
 */
export default function PriceContextBadge({
  productId,
  priceContext,
}: {
  productId: number;
  priceContext?: PriceContext | null;
}) {
  useEffect(() => {
    if (!priceContext) return;
    void ProductService.collectPriceContextImpression({
      productId,
      source: 'app_detail',
      detail: 'danawa_badge:DANAWA',
    }).catch(() => {});
  }, [productId, priceContext]);

  if (!priceContext) return null;

  const {danawaPrice, delta, normalPriceMin, normalPriceMax} = priceContext;
  // 정상가 범위는 max/min > 3배면(액세서리·변형 섞임) 신뢰를 깎으므로 숨김 — web 과 같다.
  const hasRange =
    typeof normalPriceMin === 'number' &&
    typeof normalPriceMax === 'number' &&
    normalPriceMin > 0 &&
    normalPriceMax > 0 &&
    normalPriceMax / normalPriceMin <= 3;

  return (
    <View className="mt-3 rounded-xl border border-error-100 bg-error-50 px-5 py-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-gray-700">
          다나와 최저가 대비
        </Text>
        <Text className="text-lg font-bold text-error-500">
          {Math.round(delta * 100)}% 저렴
        </Text>
      </View>
      <View className="mt-2.5 flex-row items-center justify-between border-t border-error-100 pt-2.5">
        <Text className="text-sm text-gray-500">다나와 최저가</Text>
        <Text className="text-sm font-medium text-gray-700">
          {danawaPrice.toLocaleString()}원
        </Text>
      </View>
      {hasRange ? (
        <View className="mt-1.5 flex-row items-center justify-between">
          <Text className="text-sm text-gray-500">정상가 범위</Text>
          <Text className="text-sm text-gray-500">
            {normalPriceMin.toLocaleString()} ~{' '}
            {normalPriceMax.toLocaleString()}원
          </Text>
        </View>
      ) : null}
    </View>
  );
}
