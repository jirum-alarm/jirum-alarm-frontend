import React from 'react';
import {ActivityIndicator, FlatList, Text, View} from 'react-native';

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
}: {
  items: T[];
  keyOf: (item: T) => string;
  renderCard: (item: T) => React.ReactElement;
  columns?: 2 | 3;
  isPending: boolean;
  isError: boolean;
  /** 에러 문구에 쓰는 섹션 이름. */
  label: string;
  onRetry: () => void;
  onEndReached?: () => void;
  footer?: React.ReactNode;
}) {
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
        paddingVertical: 16,
      }}
      columnWrapperStyle={{gap: GRID_GAP_X}}
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
