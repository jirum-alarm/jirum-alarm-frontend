import React, {useCallback, useMemo} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useInfiniteQuery} from '@tanstack/react-query';

import CurationGrid from '@/entities/home/ui/CurationGrid';
import {GridCard} from '@/entities/home/ui/cards/HomeProductCards';
import {
  SearchQueries,
  type SearchProductCard,
} from '@/entities/search/api/search.queries';
import {useRankingImpressionTracker} from '@/entities/trending/model/useRankingImpressionTracker';
import type {SearchFiltersController} from '@/features/search/model/useSearchFilters';

import SearchFilterBar from './SearchFilterBar';
import SearchNotFound from './SearchNotFound';

/**
 * 검색 결과. web: widgets/search/ui/SearchResult.tsx + useProductListViewModel
 *
 * ★그리드는 새로 만들지 않는다 — `CurationGrid`(2열 · 로딩 · 에러 · 빈 상태 ·
 * pull-to-refresh · 무한스크롤 · 노출 판정)와 `GridCard` 를 그대로 쓴다.
 * web 도 같은 `ProductGridCard` 라 카드 모양이 홈·발견과 저절로 일치한다.
 *
 * ⚠️필터 바가 목록 위에 **고정**된다. web 은 문서와 같이 스크롤돼 위로 사라지지만,
 * 앱에서 그렇게 하려면 `CurationGrid` 에 헤더 슬롯을 뚫어야 한다 — 그 파일은
 * 홈·발견·큐레이션·찜이 함께 쓰는 공용이라 이번 작업에서 건드리지 않았다.
 */

/** 검색 결과 카드의 노출/클릭 출처. web `ProductCardSource` 의 'search' 와 같은 값. */
const SEARCH_SOURCE = 'search';

/** web: estimatedTotal 은 Meili 5000 캡이라 그 이상은 '+' 를 붙인다. */
const ESTIMATED_TOTAL_CAP = 5000;

export default function SearchResults({
  keyword,
  controller,
  onPressProduct,
  onPressKeywordRegister,
  bottomInset,
}: {
  keyword: string;
  controller: SearchFiltersController;
  onPressProduct: (id: number) => void;
  onPressKeywordRegister: () => void;
  bottomInset: number;
}) {
  const {filters, hasActiveFilters, resetFilters} = controller;

  const {
    data,
    isPending,
    isError,
    isPlaceholderData,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(SearchQueries.products(keyword, filters));

  // ★`?? []` 를 그대로 쓰면 매 렌더 새 배열이라 아래 노출 콜백이 계속 재생성된다.
  const products = useMemo(
    () => (data?.pages ?? []).flat() as SearchProductCard[],
    [data?.pages],
  );

  // 총량은 모든 행에 같은 값이 주입되므로 첫 행에서만 읽는다(web 과 같다).
  const estimatedTotal = products[0]?.estimatedTotal ?? null;

  const {recordImpression, recordClick} =
    useRankingImpressionTracker(SEARCH_SOURCE);

  const handleViewableIndexes = useCallback(
    (indexes: number[]) => {
      for (const index of indexes) {
        const product = products[index];
        if (product) recordImpression(Number(product.id), index);
      }
    },
    [products, recordImpression],
  );

  const isEmpty = products.length === 0;

  return (
    <View className="flex-1 bg-white">
      {/* 빈 결과에서도 필터 바는 남긴다 — 필터를 풀 수 있어야 한다(web 과 같다). */}
      <SearchFilterBar controller={controller} />

      {isPending || isError || !isEmpty ? (
        <>
          {estimatedTotal != null ? (
            <View className="px-5 pb-3">
              <Text className="text-sm text-gray-500">
                {'약 '}
                <Text className="font-semibold text-gray-900">
                  {estimatedTotal.toLocaleString()}
                </Text>
                {`건${estimatedTotal >= ESTIMATED_TOTAL_CAP ? '+' : ''}`}
              </Text>
            </View>
          ) : null}
          {/*
            필터를 바꾸는 동안 이전 결과를 흐리게 둔다(web transition 디밍과 같다).
            opacity 는 style 로 — className 으로 주면 값이 렌더마다 새 클래스가 된다.
          */}
          <View
            style={isPlaceholderData ? styles.gridDimmed : styles.grid}
            pointerEvents={isPlaceholderData ? 'none' : 'auto'}>
            <CurationGrid
              items={products}
              keyOf={item => String(item.id)}
              renderCard={(item, index) => (
                <GridCard
                  product={item}
                  onPress={id => {
                    recordClick(id, index);
                    onPressProduct(id);
                  }}
                />
              )}
              isPending={isPending}
              isError={isError}
              label="검색 결과"
              onRetry={refetch}
              onViewableIndexes={handleViewableIndexes}
              bottomInset={bottomInset}
              topSpacing="tight"
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage();
              }}
              footer={
                isFetchingNextPage ? (
                  <View className="items-center py-6">
                    <ActivityIndicator size="small" color="#667085" />
                  </View>
                ) : null
              }
            />
          </View>
        </>
      ) : hasActiveFilters ? (
        // 필터 때문에 0건인 경우. 상품이 없다고 말하면 안 된다 — 풀 수 있는 필터가 있다.
        <View className="items-center px-5 pt-10" style={styles.emptyBox}>
          <Text className="text-center text-sm text-gray-500">
            {
              '선택한 필터에 맞는 결과가 없어요.\n필터를 조정하면 더 많은 딜을 볼 수 있어요.'
            }
          </Text>
          {/*
            ★공용 `Button` 을 쓰지 않는다 — base 클래스가 `w-full` 이라 화면을
            가로지르는 띠가 되고(NoAlerts 에서 겪은 함정), 회색 테두리 색도
            variant 에 없다. web 도 이 자리엔 raw button 을 쓴다.
          */}
          <Pressable
            onPress={resetFilters}
            accessibilityRole="button"
            accessibilityLabel="필터 초기화"
            className="self-center rounded-full border border-gray-300 px-4 py-2"
            style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
            <Text className="text-sm font-semibold text-gray-700">
              필터 초기화
            </Text>
          </Pressable>
        </View>
      ) : (
        <SearchNotFound
          keyword={keyword}
          onPressKeywordRegister={onPressKeywordRegister}
          onPressProduct={onPressProduct}
          bottomInset={bottomInset}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {flex: 1},
  /** 필터 전환 중 이전 결과를 흐리게(web transition 디밍과 같은 값). */
  gridDimmed: {flex: 1, opacity: 0.5},
  emptyBox: {gap: 16},
});
