import React, {useCallback, useMemo, useRef} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useInfiniteQuery, useQueryClient} from '@tanstack/react-query';

import type {ProductCardType} from '@/entities/home/model/types';
import CurationGrid from '@/entities/home/ui/CurationGrid';
import {GridCard} from '@/entities/home/ui/cards/HomeProductCards';
import {refetchFirstPage} from '@/shared/lib/client/refetch-first-page';

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

const keyOf = (item: ProductCardType) => String(item.id);

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
  const queryClient = useQueryClient();
  const liveQuery = TrendingQueries.live(categoryId);
  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(liveQuery);
  const liveKey = liveQuery.queryKey;
  const refresh = useCallback(
    () => refetchFirstPage(queryClient, liveKey),
    [queryClient, liveKey],
  );

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

  // ★카드 콜백을 고정한다 — 인라인이면 페이지가 붙을 때마다 보이는 카드가 전부 다시 그려져
  // (GridCard memo 무력화) 스크롤 중 프레임이 떨어졌다. 순번은 클릭 순간 최신 목록에서 찾는다.
  const productsRef = useRef(products);
  productsRef.current = products;
  const handlePress = useCallback(
    (id: number) => {
      const index = productsRef.current.findIndex(p => Number(p.id) === id);
      recordClick(id, index);
      onPressProduct(id);
    },
    [recordClick, onPressProduct],
  );
  const renderCard = useCallback(
    (item: ProductCardType) => (
      <GridCard product={item} onPress={handlePress} />
    ),
    [handlePress],
  );

  return (
    <CurationGrid
      items={products}
      keyOf={keyOf}
      renderCard={renderCard}
      isPending={isPending}
      isError={isError}
      label="실시간 핫딜"
      onRetry={refresh}
      onViewableIndexes={handleViewableIndexes}
      bottomInset={bottomInset}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
      }}
      footer={
        isFetchingNextPage ? (
          <View className="items-center py-6">
            <ActivityIndicator size="small" className="text-gray-500" />
          </View>
        ) : null
      }
    />
  );
}
