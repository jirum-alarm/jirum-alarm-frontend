import React, {useCallback, useRef, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {GridSkeleton} from '@/shared/components/Skeletons';

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

// ★모듈 밖에 둔다 — 인라인 화살표면 렌더마다 새 컴포넌트 타입이라 구분자가
// 전부 언마운트·재마운트된다.
function RowGap() {
  return <View style={{height: GRID_GAP_Y}} />;
}

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
  header,
  footer,
  emptyText = '상품이 없어요.',
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
  /**
   * 목록과 **같이 스크롤되는** 머리(검색 필터 바처럼 길어서 고정하면 결과를 가리는 것).
   * 화면 폭 전체를 쓴다 — 그리드 좌우 여백은 받지 않는다. 로딩·에러·빈 상태에서도 보인다.
   */
  header?: React.ReactNode;
  footer?: React.ReactNode;
  /** 빈 목록 문구(찜 목록처럼 맥락이 있으면 바꾼다). */
  emptyText?: string;
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

  // ★renderItem 을 고정한다 — 인라인이면 새로고침 스피너·페이지 추가처럼 이 그리드가
  // 다시 그려질 때마다 FlatList 가 보이는 셀을 전부 다시 그린다.
  // renderCard 가 호출부에서 인라인이면 효과는 줄지만 동작은 같다.
  const renderItem = useCallback(
    ({item, index}: ListRenderItemInfo<T>) => (
      <View style={{flex: 1 / columns}}>{renderCard(item, index)}</View>
    ),
    [renderCard, columns],
  );

  // 화면 가운데 점 하나 대신 카드 골격 — 홈·상세처럼 "곧 이렇게 채워진다" 를 보여준다.
  if (isPending) {
    return (
      <View className="flex-1 bg-white">
        {header}
        <GridSkeleton
          columns={columns}
          topSpacing={topSpacing === 'tight' ? 0 : 16}
        />
      </View>
    );
  }

  // ★데이터가 있으면 목록을 지키고 꼬리에서 다시 시도시킨다. v5 는 다음 페이지·
  // 리페치가 한 번 실패해도 isError 가 되는데(데이터는 유지), 그때 전체를 에러로
  // 바꾸면 스크롤해 온 목록이 통째로 사라졌다.
  if (isError && items.length === 0) {
    return (
      <View className="flex-1 bg-white">
        {header}
        <View className="pt-4">
          <SectionErrorRow label={label} onRetry={onRetry} />
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-white">
        {header}
        <View className="items-center py-10">
          <Text className="text-sm text-gray-500">{emptyText}</Text>
        </View>
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
      ItemSeparatorComponent={RowGap}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      // ★viewabilityConfig 는 ref 로 고정한다. 매 렌더 새 객체를 주면
      // FlatList 가 "Changing viewabilityConfig on the fly is not supported" 로
      // 죽는다(onViewableItemsChanged 도 같은 제약이라 ref 로 감싼다).
      viewabilityConfig={VIEWABILITY_CONFIG}
      onViewableItemsChanged={
        onViewableIndexes ? handleViewableItemsChanged : undefined
      }
      ListHeaderComponent={
        header ? (
          // 콘텐츠 좌우 여백을 상쇄해 머리만 화면 폭을 쓴다.
          <View
            style={{marginHorizontal: -(HORIZONTAL_PADDING - GRID_GAP_X / 2)}}>
            {header}
          </View>
        ) : null
      }
      ListFooterComponent={
        isError ? (
          <SectionErrorRow label={label} onRetry={onRetry} />
        ) : (
          (footer as React.ReactElement)
        )
      }
      renderItem={renderItem}
    />
  );
}
