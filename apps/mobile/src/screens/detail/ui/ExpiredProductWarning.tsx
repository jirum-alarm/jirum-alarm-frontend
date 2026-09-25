import React from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';

import {OrderOptionType, ProductOrderType} from '@/shared/api/gql/graphql';
import {ProductQueries} from '@/entities/product/product.queries';
import ProductCard from '@/shared/components/product/ProductCard';
import SectionErrorRow from '@/shared/components/SectionErrorRow';

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
 * web 모바일과 같이 3열 그리드, 최대 9개.
 */
export default function ExpiredProductWarning({
  product,
  onPressProduct,
  onPressMore,
}: {
  product: ProductDetail;
  onPressProduct: (id: number) => void;
  /** 더보기 → 관련 상품 전체(web `/products/{id}/related`). */
  onPressMore?: () => void;
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
    .slice(0, DISPLAY_LIMIT + 1);
  // web 과 같은 판정: 거른 뒤에도 조회 한도만큼 남아야 "더 있다"고 본다.
  const hasMore = similar.length >= FETCH_LIMIT;

  if (!isPending && !isError && similar.length === 0) return null;

  return (
    <View className="pt-7">
      <View className="flex-row items-center justify-between px-5">
        <Text className="text-lg font-semibold text-gray-900">
          최신 핫딜을 확인해 보세요
        </Text>
        {hasMore && onPressMore ? (
          <Pressable
            onPress={onPressMore}
            hitSlop={12}
            accessibilityRole="link"
            accessibilityLabel="최신 핫딜 더보기">
            <Text className="text-xs font-medium text-gray-400">더보기</Text>
          </Pressable>
        ) : null}
      </View>
      <Text className="px-5 pt-1 text-xs text-gray-500">
        이 상품은 올라온 지 며칠 지나 품절·종료됐을 수 있어요
      </Text>
      {isError ? (
        <SectionErrorRow label="최신 핫딜" onRetry={refetch} />
      ) : isPending ? (
        <View className="h-[220px] items-center justify-center">
          <ActivityIndicator size="small" color="#667085" />
        </View>
      ) : (
        <View className="flex-row flex-wrap px-[17px] pt-3">
          {similar.slice(0, DISPLAY_LIMIT).map(item => (
            <View
              key={String(item.id)}
              style={{
                width: '33.333%',
                paddingHorizontal: 3,
                paddingBottom: 12,
              }}>
              <ProductCard
                product={item}
                layout="grid"
                onPress={onPressProduct}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
