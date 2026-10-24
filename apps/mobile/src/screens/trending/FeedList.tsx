import React, {useCallback, useMemo, useRef} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useInfiniteQuery, useQueryClient} from '@tanstack/react-query';
import {HOT_FEED_CARD_SOURCE, HOT_FEED_COPY} from '@jirum/domain/ranking';

import type {ProductCardType} from '@/shared/types/product-card';
import CurationGrid from '@/entities/home/ui/CurationGrid';
import {GridCard} from '@/entities/home/ui/cards/HomeProductCards';
import {TrendingQueries} from '@/entities/trending/api/trending.queries';
import {useRankingImpressionTracker} from '@/entities/trending/model/useRankingImpressionTracker';
import {refetchFirstPage} from '@/shared/lib/client/refetch-first-page';

/**
 * 발견 탭 「실시간」 목록. web: widgets/trending/ui/FeedList.tsx
 * 「핫딜만」 칩을 켜면 문턱 넘은 딜만 핫딜 된 시각순(hot), 끄면 올라온 딜 전부 최신순(live) — 모양은 하나, 조회만 다르다.
 * 칩은 카테고리 줄 끝(TrendingScreen → CategoryTabBar trailing)에 있다 — 목록 위에 한 줄을 더 쌓지 않는다.
 * 홈 카드 UI(GridCard·CurationGrid)를 그리므로 entities 끼리 import 를 피해 screens 층에 둔다.
 *
 * ★ web 은 useInView 센티넬로 다음 페이지를 당기고 swiper autoHeight 를 손으로
 * 갱신해야 했다. FlatList 는 onEndReached 로 둘 다 필요 없다.
 */

export type FeedKind = 'live' | 'hot';

/** 「핫딜만」 끔(전부) 노출/클릭 출처 — web 과 같은 값. */
const LIVE_SOURCE = 'live_tab';

const keyOf = (item: ProductCardType) => String(item.id);

export default function FeedList({
  feed,
  categoryId,
  onPressProduct,
  bottomInset,
}: {
  feed: FeedKind;
  categoryId: number;
  onPressProduct: (id: number) => void;
  /** 탭바가 가리는 높이. 마지막 행이 탭바 밑으로 들어가지 않게 비운다. */
  bottomInset: number;
}) {
  const isHot = feed === 'hot';
  const queryClient = useQueryClient();
  const feedQuery = TrendingQueries.feed(feed, categoryId);
  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(feedQuery);
  const feedKey = feedQuery.queryKey;
  const refresh = useCallback(
    () => refetchFirstPage(queryClient, feedKey),
    [queryClient, feedKey],
  );

  const products = useMemo(
    () => (data?.pages ?? []).flat() as ProductCardType[],
    [data?.pages],
  );

  const {recordImpression, recordClick} = useRankingImpressionTracker(
    isHot ? HOT_FEED_CARD_SOURCE : LIVE_SOURCE,
  );

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
      label={isHot ? '핫딜' : '실시간 핫딜'}
      onRetry={refresh}
      onViewableIndexes={handleViewableIndexes}
      bottomInset={bottomInset}
      emptyText={HOT_FEED_COPY.empty}
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
