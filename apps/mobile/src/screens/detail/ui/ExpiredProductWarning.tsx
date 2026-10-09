import React from 'react';
import {ActivityIndicator, Pressable, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {useQueries} from '@tanstack/react-query';

import {ProductQueries} from '@/entities/product/product.queries';
import ProductCard from '@/shared/components/product/ProductCard';
import SectionErrorRow from '@/shared/components/SectionErrorRow';

import type {ProductDetail} from '../model/types';
import {dealFreshnessAt} from '../lib/price-signals';

/** 7일 지나면 품절·종료됐을 수 있다고 본다(web 과 같은 기준). */
const EXPIRE_DAYS = 7;
const FETCH_LIMIT = 10;
const DISPLAY_LIMIT = 9;

/**
 * 오래된 상품에 최신 핫딜을 권하는 블록.
 * web 모바일과 같이 3열 그리드, 최대 9개. 출처도 web 과 같다 — 동일상품 그룹 먼저, 모자라면 이 글보다 새
 * 진행 중 딜 중 같은 상품·같은 라인(서버 latestSimilarDeals). 예전 제목 키워드 최신순 검색은 채운 몫의 43%가
 * 무관 상품이었다(2026-10-09).
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
  // 토스처럼 매일 재확인되는 딜은 마지막 확인 시각 기준 — 판매 중인데 "품절됐을 수 있어요"가 붙지 않게.
  const freshAt = dealFreshnessAt(product);
  const postedAt = freshAt ? new Date(freshAt) : null;
  const days = postedAt
    ? Math.floor((Date.now() - postedAt.getTime()) / 86_400_000)
    : 0;
  const isExpired = days >= EXPIRE_DAYS;

  const currentId = Number(product.id);
  const [same, latest] = useQueries({
    queries: [
      {...ProductQueries.sameProductDeals({id: currentId}), enabled: isExpired},
      {
        ...ProductQueries.latestSimilarDeals({
          id: currentId,
          limit: FETCH_LIMIT,
        }),
        enabled: isExpired,
      },
    ],
  });

  if (!isExpired) return null;

  const seen = new Set<string>([String(currentId)]);
  const similar = [...(same.data ?? []), ...(latest.data ?? [])]
    .filter(p => {
      const k = String(p.id);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, DISPLAY_LIMIT + 1);
  // web 과 같은 판정: 거른 뒤에도 조회 한도만큼 남아야 "더 있다"고 본다.
  const hasMore = similar.length >= FETCH_LIMIT;
  const isPending = same.isPending || latest.isPending;
  // 한쪽만 실패하면 받은 쪽만 보인다 — 둘 다 비었을 때만 오류 줄.
  const isError = (same.isError || latest.isError) && similar.length === 0;
  const refetch = () => {
    same.refetch();
    latest.refetch();
  };

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
            accessibilityLabel="최신 핫딜 더보기"
            style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
            <Text className="text-xs font-medium text-gray-500">더보기</Text>
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
          <ActivityIndicator size="small" className="text-gray-500" />
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
