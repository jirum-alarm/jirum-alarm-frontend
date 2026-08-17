import React, {useCallback, useState} from 'react';
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
  /**
   * 위쪽 여백. 칩 줄이 위에 있는 화면(토스)은 컨테이너 gap 이 간격을 잡으므로
   * 'tight'(0)로 둔다. 칩이 없는 화면(큐레이션)은 기본 16px.
   */
  topSpacing = 'normal',
}: {
  items: T[];
  keyOf: (item: T) => string;
  renderCard: (item: T) => React.ReactElement;
  columns?: 2 | 3;
  isPending: boolean;
  isError: boolean;
  /** 에러 문구에 쓰는 섹션 이름. */
  label: string;
  /** 에러 재시도 + pull-to-refresh 공용. react-query refetch 를 그대로 받는다. */
  onRetry: () => void | Promise<unknown>;
  onEndReached?: () => void;
  footer?: React.ReactNode;
  topSpacing?: 'normal' | 'tight';
}) {
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
        paddingBottom: 16,
      }}
      columnWrapperStyle={{gap: GRID_GAP_X}}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      ItemSeparatorComponent={() => <View style={{height: GRID_GAP_Y}} />}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={footer as React.ReactElement}
      renderItem={({item}) => (
        <View style={{flex: 1 / columns}}>{renderCard(item)}</View>
      )}
    />
  );
}
