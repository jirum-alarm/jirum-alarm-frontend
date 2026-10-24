import React, {useCallback, useMemo, useRef} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useInfiniteQuery, useQueryClient} from '@tanstack/react-query';
import {text} from '@jirum/design-system/recipes';
import {HOT_FEED_CARD_SOURCE, HOT_FEED_COPY} from '@jirum/domain/ranking';

import type {ProductCardType} from '@/shared/types/product-card';
import CurationGrid from '@/entities/home/ui/CurationGrid';
import {GridCard} from '@/entities/home/ui/cards/HomeProductCards';
import {Text} from '@/shared/components/ui/Text/AppText';
import {refetchFirstPage} from '@/shared/lib/client/refetch-first-page';

import {TrendingQueries} from '@/entities/trending/api/trending.queries';
import {useRankingImpressionTracker} from '@/entities/trending/model/useRankingImpressionTracker';

/**
 * 핫딜만 목록. web: widgets/trending/ui/HotFeedList.tsx + useHotFeedViewModel
 * 실시간(LiveList)과 같은 그리드·무한스크롤 — 다른 건 조회(문턱 넘은 딜만)와 위 기준 한 줄.
 * 홈 카드 UI(GridCard·CurationGrid)를 그리므로 entities 끼리 import 를 피해 screens 층에 둔다.
 */

const keyOf = (item: ProductCardType) => String(item.id);

export default function HotFeedList({
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
  const hotQuery = TrendingQueries.hot(categoryId);
  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(hotQuery);
  const hotKey = hotQuery.queryKey;
  const refresh = useCallback(
    () => refetchFirstPage(queryClient, hotKey),
    [queryClient, hotKey],
  );

  const products = useMemo(
    () => (data?.pages ?? []).flat() as ProductCardType[],
    [data?.pages],
  );

  const {recordImpression, recordClick} =
    useRankingImpressionTracker(HOT_FEED_CARD_SOURCE);

  const handleViewableIndexes = useCallback(
    (indexes: number[]) => {
      for (const index of indexes) {
        const product = products[index];
        if (product) recordImpression(Number(product.id), index);
      }
    },
    [products, recordImpression],
  );

  // LiveList 와 같은 이유로 카드 콜백을 고정한다(GridCard memo).
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
      label="핫딜"
      onRetry={refresh}
      onViewableIndexes={handleViewableIndexes}
      bottomInset={bottomInset}
      emptyText={HOT_FEED_COPY.empty}
      header={
        <View className="px-5 pb-4">
          <Text className={text.muted}>{HOT_FEED_COPY.lead}</Text>
        </View>
      }
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
