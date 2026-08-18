import React, {useCallback, useMemo} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useInfiniteQuery} from '@tanstack/react-query';

import type {ProductCardType} from '@/entities/home/model/types';
import CurationGrid from '@/entities/home/ui/CurationGrid';
import {GridCard} from '@/entities/home/ui/cards/HomeProductCards';

import {TrendingQueries} from '../api/trending.queries';
import {useRankingImpressionTracker} from '../model/useRankingImpressionTracker';

/**
 * 실시간 목록. web: widgets/trending/ui/LiveList.tsx + useLiveViewModel
 *
 * ★ web 은 useInView 센티넬로 다음 페이지를 당기고 swiper autoHeight 를 손으로
 * 갱신해야 했다. FlatList 는 onEndReached 로 둘 다 필요 없다.
 */

/** 실시간 탭 노출/클릭 출처. 백엔드 CTR 집계가 이 값으로 필터한다. */
const LIVE_SOURCE = 'live_tab';

export default function LiveList({
  categoryId,
  onPressProduct,
  bottomInset,
}: {
  categoryId: number;
  onPressProduct: (id: number) => void;
  /** 탭바가 가리는 높이. 마지막 행이 탭바 밑으로 들어가지 않게 비운다. */
  bottomInset: number;
}) {
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(TrendingQueries.live(categoryId));

  const products = useMemo(
    () => (data?.pages ?? []).flat() as ProductCardType[],
    [data?.pages],
  );

  const {recordImpression, recordClick} =
    useRankingImpressionTracker(LIVE_SOURCE);

  const handleViewableIndexes = useCallback(
    (indexes: number[]) => {
      for (const index of indexes) {
        const product = products[index];
        if (product) recordImpression(Number(product.id), index);
      }
    },
    [products, recordImpression],
  );

  return (
    <CurationGrid
      items={products}
      keyOf={item => String(item.id)}
      renderCard={(item, index) => (
        <GridCard
          product={item}
          onPress={id => {
            recordClick(id, index);
            onPressProduct(id);
          }}
        />
      )}
      isPending={isPending}
      isError={isError}
      label="실시간 핫딜"
      onRetry={refetch}
      onViewableIndexes={handleViewableIndexes}
      bottomInset={bottomInset}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      footer={
        isFetchingNextPage ? (
          <View className="items-center py-6">
            <ActivityIndicator size="small" color="#667085" />
          </View>
        ) : null
      }
    />
  );
}
