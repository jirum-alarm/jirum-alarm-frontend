import React, {useCallback, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import SectionErrorRow from '@/shared/components/SectionErrorRow';

/**
 * 더보기(목록) 화면들이 공유하는 그리드 껍데기.
 *
 * 큐레이션과 토스 특가가 같은 레이아웃(2/3열·간격·로딩·에러·빈 상태·무한스크롤)을
 * 쓰지만 **카드는 다르다** — 토스는 `data.toss` 전용 카드라 공유 필드가
 * title·price 뿐이다(curation-toss-theme-are-not-interchangeable).
 * 그래서 카드만 주입받고 나머지를 공통화한다.
 */

const GRID_GAP_X = 12; // web gap-x-3
const GRID_GAP_Y = 20; // web gap-y-5
const HORIZONTAL_PADDING = 20; // web px-5

/** web 은 카드가 50% 보이면 노출로 셌다(useInView threshold 0.5). */
const VIEWABILITY_CONFIG = {itemVisiblePercentThreshold: 50};

export default function CurationGrid<T>({
  items,
  keyOf,
  renderCard,
  columns = 2,
  isPending,
  isError,
  label,
  onRetry,
  onEndReached,
  footer,
  onViewableIndexes,
  bottomInset = 0,
  /**
   * 위쪽 여백. 칩 줄이 위에 있는 화면(토스)은 컨테이너 gap 이 간격을 잡으므로
   * 'tight'(0)로 둔다. 칩이 없는 화면(큐레이션)은 기본 16px.
   */
  topSpacing = 'normal',
}: {
  items: T[];
  keyOf: (item: T) => string;
  /** index 는 발견 탭이 노출 position 으로 쓴다. 기존 호출부는 무시하면 된다. */
  renderCard: (item: T, index: number) => React.ReactElement;
  columns?: 2 | 3;
  isPending: boolean;
  isError: boolean;
  /** 에러 문구에 쓰는 섹션 이름. */
  label: string;
  /** 에러 재시도 + pull-to-refresh 공용. react-query refetch 를 그대로 받는다. */
  onRetry: () => void | Promise<unknown>;
  onEndReached?: () => void;
  footer?: React.ReactNode;
  /**
   * 화면에 실제로 보인 카드의 index 를 알려준다(CTR 분모).
   * RN 엔 IntersectionObserver 가 없어 FlatList 만 이걸 알 수 있다.
   */
  onViewableIndexes?: (indexes: number[]) => void;
  /**
   * 탭바가 보이는 화면(발견 탭)이 비워야 할 하단 높이.
   * 큐레이션·토스는 탭바를 숨기므로 기본 0 이다.
   */
  bottomInset?: number;
  topSpacing?: 'normal' | 'tight';
}) {
  // onViewableItemsChanged 는 FlatList 가 첫 렌더의 함수만 쓴다(교체하면 예외).
  // 최신 콜백을 ref 로 읽어 안정된 핸들러 하나를 유지한다.
  const onViewableIndexesRef = useRef(onViewableIndexes);
  onViewableIndexesRef.current = onViewableIndexes;
  const handleViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: {index: number | null}[]}) => {
      const indexes = viewableItems
        .map(v => v.index)
        .filter((i): i is number => i !== null);
      if (indexes.length > 0) onViewableIndexesRef.current?.(indexes);
    },
  ).current;

  // pull-to-refresh. 홈(HomeScreen)과 같은 패턴 — 스피너는 당기는 동안만.
  // isRefetching 을 그대로 쓰면 백그라운드 리페치에도 스피너가 떠서 분리한다.
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRetry();
    } finally {
      setRefreshing(false);
    }
  }, [onRetry]);
  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="small" color="#667085" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-white pt-4">
        <SectionErrorRow label={label} onRetry={onRetry} />
      </View>
    );
  }

  if (items.length === 0) {
    // web EmptyState — "상품이 없습니다."
    return (
      <View className="flex-1 items-center bg-white py-10">
        <Text className="text-sm text-gray-500">상품이 없습니다.</Text>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-white"
      data={items}
      keyExtractor={keyOf}
      numColumns={columns}
      contentContainerStyle={{
        paddingHorizontal: HORIZONTAL_PADDING - GRID_GAP_X / 2,
        paddingTop: topSpacing === 'tight' ? 0 : 16,
        paddingBottom: 16 + bottomInset,
      }}
      columnWrapperStyle={{gap: GRID_GAP_X}}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      ItemSeparatorComponent={() => <View style={{height: GRID_GAP_Y}} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      // ★viewabilityConfig 는 ref 로 고정한다. 매 렌더 새 객체를 주면
      // FlatList 가 "Changing viewabilityConfig on the fly is not supported" 로
      // 죽는다(onViewableItemsChanged 도 같은 제약이라 ref 로 감싼다).
      viewabilityConfig={VIEWABILITY_CONFIG}
      onViewableItemsChanged={
        onViewableIndexes ? handleViewableItemsChanged : undefined
      }
      ListFooterComponent={footer as React.ReactElement}
      renderItem={({item, index}) => (
        <View style={{flex: 1 / columns}}>{renderCard(item, index)}</View>
      )}
    />
  );
}
