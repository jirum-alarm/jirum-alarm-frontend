import {emptyText as emptyTextClass} from '@jirum/design-system/recipes';
import {FlashList, type ListRenderItemInfo} from '@shopify/flash-list';
import React, {useCallback, useRef, useState} from 'react';
import {RefreshControl, ScrollView, View} from 'react-native';
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
 *
 * ★FlashList(v2) — 화면 밖으로 나간 칸을 **언마운트하지 않고 다음 상품으로 다시 쓴다**.
 * 검색·큐레이션·토스·찜·관련 상품·발견 실시간 6화면 공용이라 여기서 바꿨다(2026-10-15 실측은 커밋 본문).
 * ⚠️카드 안에 `useState` 를 두면 재사용된 칸에 이전 상품의 상태가 남는다 —
 * 상품 id 를 `key` 로 주거나(찜 하트) uri 가 바뀌면 리셋한다(Thumbnail).
 */

const GRID_GAP_X = 12; // web gap-x-3
const GRID_GAP_Y = 20; // web gap-y-5
/**
 * 화면 가장자리 ~ 카드 = 14. FlatList 시절(padding 14 + columnWrapper gap 12)과 같은 모양을
 * 유지한다 — 칸마다 GAP_X/2 씩 안쪽 여백을 주므로 바깥 여백은 그만큼 뺀다.
 */
const EDGE_X = 14;
const CONTENT_PADDING_X = EDGE_X - GRID_GAP_X / 2;

/**
 * 랭킹 목록(RankingList, 아직 FlatList)의 가상화 창. 위아래 3화면이면 빠르게 넘겨도 빈칸이 안 보인다.
 * 이 그리드는 FlashList 라 창 설정이 없다(drawDistance 기본값 — 화면 밖 250pt 만 그리고 칸을 재사용).
 */
export const GRID_WINDOW_SIZE = 7;

/** web 은 카드가 50% 보이면 노출로 셌다(useInView threshold 0.5). */
// ★minimumViewTime 0 — FlashList 기본값은 250ms 라 빠르게 넘긴 카드가 노출에서 빠진다(실측: 8000pt/s 로
// 400장 지나가는 동안 노출 12장, FlatList 는 400장). CTR 분모가 바뀌지 않게 FlatList 기본값(0)과 맞춘다.
const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 50,
  minimumViewTime: 0,
};
const MVCP_DISABLED = {disabled: true};

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
  // 다시 그려질 때마다 목록이 보이는 셀을 전부 다시 그린다.
  // renderCard 가 호출부에서 인라인이면 효과는 줄지만 동작은 같다.
  // 칸 폭은 FlashList 가 (폭 / columns) 로 정한다 — 열 간격은 칸 안쪽 여백으로.
  const renderItem = useCallback(
    ({item, index}: ListRenderItemInfo<T>) => (
      <View style={{paddingHorizontal: GRID_GAP_X / 2}}>
        {renderCard(item, index)}
      </View>
    ),
    [renderCard],
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

  // 빈 결과도 당겨서 다시 불러올 수 있게 ScrollView 로 — View 면 당길 데가 없다.
  if (items.length === 0) {
    return (
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{flexGrow: 1}}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        {header}
        <View className="items-center py-10">
          <Text className={emptyTextClass}>{emptyText}</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    // FlashList 는 NativeWind className 을 받지 않는다 — 바탕색은 감싸는 View 가.
    <View className="flex-1 bg-white">
      <FlashList
        data={items}
        keyExtractor={keyOf}
        numColumns={columns}
        contentContainerStyle={{
          paddingHorizontal: CONTENT_PADDING_X,
          paddingTop: topSpacing === 'tight' ? 0 : 16,
          paddingBottom: 16 + bottomInset,
        }}
        // 검색 결과를 내려 보면 키보드가 내려간다(검색 화면이 이 그리드를 쓴다).
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        // v2 는 칸마다 아래에 붙인다(마지막 줄 제외) — 줄 간격이 된다.
        ItemSeparatorComponent={RowGap}
        // ★v2 기본값(켜짐)은 위에 항목이 끼면 보던 카드를 붙잡는다 — 당겨서 새로고침으로
        // 새 딜이 맨 위에 들어와도 화면이 옛 첫 카드에 머문다. FlatList 처럼 끈다.
        maintainVisibleContentPosition={MVCP_DISABLED}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        // ★viewabilityConfig 는 모듈 상수로 고정한다(FlatList 시절 "Changing
        // viewabilityConfig on the fly is not supported" 제약 — 핸들러도 ref 로 고정).
        viewabilityConfig={VIEWABILITY_CONFIG}
        onViewableItemsChanged={
          onViewableIndexes ? handleViewableItemsChanged : undefined
        }
        ListHeaderComponent={
          header ? (
            // 콘텐츠 좌우 여백을 상쇄해 머리만 화면 폭을 쓴다.
            <View style={{marginHorizontal: -CONTENT_PADDING_X}}>{header}</View>
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
    </View>
  );
}
