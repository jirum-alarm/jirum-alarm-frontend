import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  View,
  type ListRenderItemInfo,
  type ViewToken,
} from 'react-native';
import {sectionTitle} from '@jirum/design-system/recipes';
import {Text} from '@/shared/components/ui/Text/AppText';
import {tick} from '@/shared/lib/feedback/haptic';
import {useQuery} from '@tanstack/react-query';

import type {ProductCardType} from '@/shared/types/product-card';
import {CarouselList} from '@/entities/home/ui/DynamicProductList';
import {GridCard} from '@/entities/home/ui/cards/HomeProductCards';
import type {ProductCardSource} from '@/shared/lib/analytics/card-tracking';
import SectionErrorRow from '@/shared/components/SectionErrorRow';

import {RANKING_SPLIT, TrendingQueries} from '../api/trending.queries';
import {useRankingImpressionTracker} from '../model/useRankingImpressionTracker';
import {GridSkeleton} from '@/shared/components/Skeletons';
import {GRID_WINDOW_SIZE} from '@/entities/home/ui/CurationGrid';

/**
 * 랭킹 목록. web: widgets/trending/ui/TrendingList.tsx + useTrendingViewModel
 *
 * 구성(web 과 같은 순서):
 *   랭킹 1~10 → "'{카테고리}' 실시간 핫딜" 캐러셀 → 랭킹 11~50 → '추천 핫딜' 캐러셀
 *
 * ★FlatList 한 줄 = 그리드 한 줄(카드 2장) 또는 캐러셀 하나. 예전엔 ScrollView 에 50장을 한 번에
 * 그렸다 — 칩을 누를 때마다(key 로 갈아끼움) 카드 50장·사진 50장을 처음부터 다시 만들어 칩 반응이
 * 한 박자 늦었다. 이제 첫 화면 몇 줄만 그리고 나머지는 스크롤하면서 그린다.
 * 노출도 카드 onLayout + 스크롤 위치 계산 대신 FlatList 의 onViewableItemsChanged(50% 보임, web 과 같은 기준).
 */

/** 랭킹 탭 노출/클릭 출처. 백엔드 CTR 집계가 이 값으로 필터한다. */
const RANKING_SOURCE = 'ranking_tab';
const COLUMNS = 2;
const GRID_GAP_X = 12; // web gap-x-3
const GRID_GAP_Y = 20; // web gap-y-5
const SECTION_GAP = 32;
const H_PADDING = 20; // web px-5
/** 첫 화면 = 그리드 4줄(8장). 그 뒤로는 스크롤하며 4줄씩. */
const ROWS_PER_BATCH = 4;
const VIEWABILITY_CONFIG = {itemVisiblePercentThreshold: 50};

type GridRow = {
  type: 'grid';
  key: string;
  products: ProductCardType[];
  /** 이 줄 첫 카드의 0-based position(CTR 계측·뱃지 = position + 1). */
  positionFrom: number;
  gapAfter: number;
};
type CarouselRow = {
  type: 'carousel';
  key: string;
  title: string;
  products: ProductCardType[];
  source: ProductCardSource;
  gapAfter: number;
};
export type RankingRow = GridRow | CarouselRow;

/**
 * 화면에 그릴 줄 목록. 랭킹을 2장씩 끊고, 11위 앞·맨 끝에 캐러셀을 끼운다.
 * 줄 사이 간격은 그리드끼리 20, 섹션 경계 32(예전 ScrollView gap 과 같다).
 */
export function buildRankingRows({
  products,
  categoryName,
  live,
  recommended,
}: {
  products: ProductCardType[];
  categoryName: string;
  live?: ProductCardType[];
  recommended?: ProductCardType[];
}): RankingRow[] {
  const rows: RankingRow[] = [];
  const pushGrid = (from: number, to: number) => {
    for (let i = from; i < Math.min(to, products.length); i += COLUMNS) {
      rows.push({
        type: 'grid',
        key: `grid-${i}`,
        products: products.slice(i, Math.min(i + COLUMNS, to)),
        positionFrom: i,
        gapAfter:
          i + COLUMNS < Math.min(to, products.length)
            ? GRID_GAP_Y
            : SECTION_GAP,
      });
    }
  };
  pushGrid(0, RANKING_SPLIT);
  if (live && live.length > 0) {
    rows.push({
      type: 'carousel',
      key: 'live',
      title: `'${categoryName}' 실시간 핫딜`,
      products: live,
      source: 'trending_live',
      gapAfter: SECTION_GAP,
    });
  }
  pushGrid(RANKING_SPLIT, products.length);
  if (recommended && recommended.length > 0) {
    rows.push({
      type: 'carousel',
      key: 'recommend',
      title: '추천 핫딜',
      products: recommended,
      source: 'trending_recommend',
      gapAfter: SECTION_GAP,
    });
  }
  const last = rows.at(-1);
  if (last) rows[rows.length - 1] = {...last, gapAfter: 0};
  return rows;
}

export default function RankingList({
  categoryId,
  categoryName,
  onPressProduct,
  bottomInset,
}: {
  categoryId: number;
  categoryName: string;
  onPressProduct: (id: number) => void;
  bottomInset: number;
}) {
  const ranking = useQuery(TrendingQueries.ranking(categoryId));
  const live = useQuery(TrendingQueries.rankingLive(categoryId));
  const recommended = useQuery(TrendingQueries.recommended());

  const {recordImpression, recordClick} =
    useRankingImpressionTracker(RANKING_SOURCE);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    tick();
    setRefreshing(true);
    try {
      await Promise.all([
        ranking.refetch(),
        live.refetch(),
        recommended.refetch(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [ranking, live, recommended]);

  const rows = useMemo(
    () =>
      buildRankingRows({
        products: ranking.data ?? [],
        categoryName,
        live: live.data,
        recommended: recommended.data,
      }),
    [ranking.data, categoryName, live.data, recommended.data],
  );

  const handlePress = useCallback(
    (id: number, position: number) => {
      recordClick(id, position);
      onPressProduct(id);
    },
    [recordClick, onPressProduct],
  );

  // onViewableItemsChanged 는 FlatList 가 첫 렌더의 함수만 쓴다(교체하면 예외) — 최신 기록 함수는 ref 로.
  const recordImpressionRef = useRef(recordImpression);
  recordImpressionRef.current = recordImpression;
  const handleViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: ViewToken<RankingRow>[]}) => {
      for (const {item} of viewableItems) {
        if (item?.type !== 'grid') continue;
        item.products.forEach((product, i) =>
          recordImpressionRef.current(
            Number(product.id),
            item.positionFrom + i,
          ),
        );
      }
    },
  ).current;

  const renderItem = useCallback(
    ({item}: ListRenderItemInfo<RankingRow>) =>
      item.type === 'grid' ? (
        <RankedRow row={item} onPress={handlePress} />
      ) : (
        <View style={{marginBottom: item.gapAfter}}>
          <CarouselSection
            title={item.title}
            products={item.products}
            onPressProduct={onPressProduct}
            trackingSource={item.source}
          />
        </View>
      ),
    [handlePress, onPressProduct],
  );

  // 랭킹은 2열 그리드로 시작한다 — 같은 골격을 먼저 그린다.
  if (ranking.isPending) {
    return (
      <View className="flex-1 bg-white">
        <GridSkeleton />
      </View>
    );
  }

  if (ranking.isError) {
    return (
      <View className="flex-1 bg-white pt-4">
        <SectionErrorRow label="랭킹" onRetry={ranking.refetch} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-white"
      data={rows}
      keyExtractor={rowKey}
      renderItem={renderItem}
      initialNumToRender={ROWS_PER_BATCH}
      maxToRenderPerBatch={ROWS_PER_BATCH}
      windowSize={GRID_WINDOW_SIZE}
      // removeClippedSubviews 는 쓰지 않는다 — Android Fabric 에서 잘라낸 뷰를 다시 붙이다 addViewAt IllegalStateException 으로 앱이 죽었다(Sentry 2026-10, 1.4.7).
      viewabilityConfig={VIEWABILITY_CONFIG}
      onViewableItemsChanged={handleViewableItemsChanged}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{
        paddingTop: 16,
        paddingBottom: bottomInset + 16,
      }}
    />
  );
}

const rowKey = (row: RankingRow) => row.key;

/** 랭킹 뱃지가 붙은 그리드 한 줄(2장). 마지막 줄이 1장이면 왼쪽 반만 채운다. */
const RankedRow = React.memo(function RankedRow({
  row,
  onPress,
}: {
  row: GridRow;
  onPress: (id: number, position: number) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingHorizontal: H_PADDING - GRID_GAP_X / 2,
        marginBottom: row.gapAfter,
      }}>
      {row.products.map((product, i) => (
        <RankedCell
          key={product.id}
          product={product}
          position={row.positionFrom + i}
          onPress={onPress}
        />
      ))}
    </View>
  );
});

const RankedCell = React.memo(function RankedCell({
  product,
  position,
  onPress,
}: {
  product: ProductCardType;
  position: number;
  onPress: (id: number, position: number) => void;
}) {
  // GridCard 는 memo 다 — 인라인 화살표를 넘기면 부모가 그릴 때마다 memo 가 깨진다.
  const handlePress = useCallback(
    (id: number) => onPress(id, position),
    [onPress, position],
  );
  return (
    <View
      style={{width: `${100 / COLUMNS}%`, paddingHorizontal: GRID_GAP_X / 2}}>
      <GridCard
        product={product}
        rank={position + 1}
        onPress={handlePress}
        trackingSource="ranking_tab"
      />
    </View>
  );
});

/** 제목 + 가로 캐러셀. web CarouselProductsSection(nested) 과 같은 모양. */
function CarouselSection({
  title,
  products,
  onPressProduct,
  trackingSource,
}: {
  title: string;
  products: ProductCardType[];
  onPressProduct: (id: number) => void;
  trackingSource: ProductCardSource;
}) {
  return (
    <View style={{gap: 8}}>
      <View style={{paddingHorizontal: H_PADDING}}>
        <Text className={sectionTitle.page}>{title}</Text>
      </View>
      <CarouselList
        products={products}
        onPressProduct={onPressProduct}
        trackingSource={trackingSource}
      />
    </View>
  );
}
