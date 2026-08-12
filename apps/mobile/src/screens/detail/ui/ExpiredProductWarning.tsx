import React from 'react';
import {Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';

import {OrderOptionType, ProductOrderType} from '@/shared/api/gql/graphql';
import {ProductQueries} from '@/entities/product/product.queries';
import ProductCarouselSection from '@/shared/components/product/ProductCarouselSection';

import type {ProductDetail} from '../model/types';

/** 7일 지나면 품절·종료됐을 수 있다고 본다(web 과 같은 기준). */
const EXPIRE_DAYS = 7;
const FETCH_LIMIT = 10;
const DISPLAY_LIMIT = 9;

/** web ExpiredProductRecommendations 와 같은 키워드 추출. */
function deriveSearchKeyword(title: string): string {
  return (
    title
      .replace(/^\[.*?\]\s*/, '')
      .split('(')[0]
      .trim() || title
  );
}

/**
 * 오래된 상품에 최신 핫딜을 권하는 블록.
 *
 * web 은 그리드로 9개를 깔지만 여기서는 이미 있는 가로 캐러셀을 쓴다 —
 * 두 번째 리스트 UI 를 새로 만들 만큼의 차이가 없고, 앱에서는 세로 그리드가
 * 상세 흐름을 끊는다.
 */
export default function ExpiredProductWarning({
  product,
  onPressProduct,
}: {
  product: ProductDetail;
  onPressProduct: (id: number) => void;
}) {
  const postedAt = product.postedAt ? new Date(product.postedAt) : null;
  const days = postedAt
    ? Math.floor((Date.now() - postedAt.getTime()) / 86_400_000)
    : 0;
  const isExpired = days >= EXPIRE_DAYS;

  const keyword = deriveSearchKeyword(product.title);

  const {data, isPending, isError, refetch} = useQuery({
    ...ProductQueries.keywordProducts({
      keyword,
      limit: FETCH_LIMIT,
      orderBy: ProductOrderType.Id,
      orderOption: OrderOptionType.Desc,
    }),
    enabled: isExpired && keyword.length > 0,
  });

  if (!isExpired) return null;

  // 자기 자신보다 나중에 올라온 것만 = 더 최신 딜(web 과 같은 규칙).
  const currentId = Number(product.id);
  const seen = new Set<string>();
  const similar = (data ?? [])
    .filter(p => Number(p.id) > currentId)
    .filter(p => {
      const k = String(p.id);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, DISPLAY_LIMIT);

  if (!isPending && !isError && similar.length === 0) return null;

  return (
    <View className="pt-7">
      <Text className="px-5 text-lg font-semibold text-gray-900">
        최신 핫딜을 확인해 보세요
      </Text>
      <Text className="px-5 pt-1 text-xs text-gray-500">
        이 상품은 올라온 지 며칠 지나 품절·종료됐을 수 있어요
      </Text>
      <ProductCarouselSection
        title=""
        products={similar}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        onPressProduct={onPressProduct}
      />
    </View>
  );
}
