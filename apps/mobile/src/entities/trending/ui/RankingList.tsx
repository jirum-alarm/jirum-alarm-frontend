import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';

import type {ProductCardType} from '@/entities/home/model/types';
import {CarouselList} from '@/entities/home/ui/DynamicProductList';
import {GridCard} from '@/entities/home/ui/cards/HomeProductCards';
import SectionErrorRow from '@/shared/components/SectionErrorRow';

import {RANKING_SPLIT, TrendingQueries} from '../api/trending.queries';
import {useRankingImpressionTracker} from '../model/useRankingImpressionTracker';

/**
 * 랭킹 목록. web: widgets/trending/ui/TrendingList.tsx + useTrendingViewModel
 *
 * 구성(web 과 같은 순서):
 *   랭킹 1~10 → "'{카테고리}' 실시간 핫딜" 캐러셀 → 랭킹 11~50 → '추천 핫딜' 캐러셀
 *
 * ★ FlatList 가 아니라 ScrollView 다 — 그리드가 캐러셀로 두 동막 나뉘어
 * 한 줄 목록이 아니다(web 도 같은 이유로 grid 두 개를 따로 그린다).
 * 그래서 노출 판정은 onViewableItemsChanged 를 못 쓰고 스크롤 위치로 한다.
 */

/** 랭킹 탭 노출/클릭 출처. 백엔드 CTR 집계가 이 값으로 필터한다. */
const RANKING_SOURCE = 'ranking_tab';
const GRID_GAP_X = 12; // web gap-x-3
const GRID_GAP_Y = 20; // web gap-y-5
const H_PADDING = 20; // web px-5

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

  // ★ `?? []` 를 그대로 쓰면 매 렌더 새 배열이라 아래 useMemo·useCallback 의
  // 의존성이 항상 바뀐다(노출 기록 콜백이 매 렌더 재생성된다).
  const products = useMemo(() => ranking.data ?? [], [ranking.data]);
  const {recordImpression, recordClick} =
    useRankingImpressionTracker(RANKING_SOURCE);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
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

  /**
   * 노출 기록. ScrollView 라 카드별 뷰포트 판정이 없으므로 스크롤 오프셋과
   * 카드 y 위치를 비교한다 — onLayout 으로 모은 위치를 쓴다.
   * (web 은 카드마다 IntersectionObserver 를 달았다)
   */
  const positionsRef = React.useRef<Record<number, number>>({});
  const viewportRef = React.useRef(0);

  const handleScroll = useCallback(
    (y: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      for (const [key, top] of Object.entries(positionsRef.current)) {
        const index = Number(key);
        const product = products[index];
        if (!product) continue;
        // 카드 상단이 화면 안에 들어오면 노출로 센다(중복은 트래커가 막는다).
        if (top >= y && top <= y + viewport) {
          recordImpression(Number(product.id), index);
        }
      }
    },
    [products, recordImpression],
  );

  const handlePress = useCallback(
    (id: number, index: number) => {
      recordClick(id, index);
      onPressProduct(id);
    },
    [recordClick, onPressProduct],
  );

  const registerPosition = useCallback((index: number, y: number) => {
    positionsRef.current[index] = y;
  }, []);

  const topProducts = useMemo(
    () => products.slice(0, RANKING_SPLIT),
    [products],
  );
  const restProducts = useMemo(() => products.slice(RANKING_SPLIT), [products]);

  if (ranking.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="small" color="#667085" />
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
    <ScrollView
      className="flex-1 bg-white"
      scrollEventThrottle={200}
      onLayout={e => {
        viewportRef.current = e.nativeEvent.layout.height;
      }}
      onScroll={e => handleScroll(e.nativeEvent.contentOffset.y)}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{
        paddingTop: 16,
        paddingBottom: bottomInset + 16,
        gap: 32,
      }}>
      <RankedGrid
        products={topProducts}
        rankFrom={1}
        positionFrom={0}
        onPress={handlePress}
        onCardLayout={registerPosition}
      />

      {live.data && live.data.length > 0 && (
        <CarouselSection
          title={`'${categoryName}' 실시간 핫딜`}
          products={live.data}
          onPressProduct={onPressProduct}
        />
      )}

      <RankedGrid
        products={restProducts}
        rankFrom={RANKING_SPLIT + 1}
        positionFrom={RANKING_SPLIT}
        onPress={handlePress}
        onCardLayout={registerPosition}
      />

      {recommended.data && recommended.data.length > 0 && (
        <CarouselSection
          title="추천 핫딜"
          products={recommended.data}
          onPressProduct={onPressProduct}
        />
      )}
    </ScrollView>
  );
}

/**
 * 랭킹 뱃지가 붙은 2열 그리드.
 * FlatList numColumns 대신 flexWrap — 바깥이 이미 ScrollView 라
 * 중첩 VirtualizedList 경고를 피한다(홈 ProductGrid 와 같은 처방).
 */
function RankedGrid({
  products,
  rankFrom,
  positionFrom,
  onPress,
  onCardLayout,
}: {
  products: ProductCardType[];
  /** 이 그리드 첫 카드의 1-based 랭킹(뱃지 표시용). */
  rankFrom: number;
  /** 이 그리드 첫 카드의 0-based position(CTR 계측용). */
  positionFrom: number;
  onPress: (id: number, position: number) => void;
  onCardLayout: (position: number, y: number) => void;
}) {
  // 이 그리드가 스크롤 콘텐츠 안에서 시작하는 y. 카드 y 에 더해 절대좌표를 만든다.
  const gridTopRef = React.useRef(0);

  if (products.length === 0) return null;

  const columns = 2;
  const lastRowStart = Math.floor((products.length - 1) / columns) * columns;

  return (
    <View
      onLayout={e => {
        gridTopRef.current = e.nativeEvent.layout.y;
      }}
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: H_PADDING - GRID_GAP_X / 2,
      }}>
      {products.map((product, i) => {
        const position = positionFrom + i;
        return (
          <View
            key={product.id}
            // ★ onLayout 의 y 는 부모 기준이라 그리드 자체의 y 를 더해야
            // 스크롤 오프셋과 비교할 수 있는 절대좌표가 된다. 두 번째 그리드는
            // 캐러셀 아래에 있어 이걸 빼먹으면 노출이 전부 첫 화면으로 계산된다.
            onLayout={e =>
              onCardLayout(
                position,
                gridTopRef.current + e.nativeEvent.layout.y,
              )
            }
            style={{
              width: `${100 / columns}%`,
              paddingHorizontal: GRID_GAP_X / 2,
              marginBottom: i >= lastRowStart ? 0 : GRID_GAP_Y,
            }}>
            <GridCard
              product={product}
              rank={rankFrom + i}
              onPress={id => onPress(id, position)}
            />
          </View>
        );
      })}
    </View>
  );
}

/** 제목 + 가로 캐러셀. web CarouselProductsSection(nested) 과 같은 모양. */
function CarouselSection({
  title,
  products,
  onPressProduct,
}: {
  title: string;
  products: ProductCardType[];
  onPressProduct: (id: number) => void;
}) {
  return (
    <View style={{gap: 8}}>
      <View style={{paddingHorizontal: H_PADDING}}>
        <Text className="text-lg font-bold text-gray-900">{title}</Text>
      </View>
      <CarouselList products={products} onPressProduct={onPressProduct} />
    </View>
  );
}
