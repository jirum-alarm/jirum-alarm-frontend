import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';

import {CarouselList} from '@/entities/home/ui/DynamicProductList';
import {CAROUSEL_CARD_WIDTH} from '@/entities/home/ui/cards/HomeProductCards';
import {TrendingQueries} from '@/entities/trending/api/trending.queries';
import {SkeletonBox} from '@/shared/components/Skeletons';

import RecentKeywords from './RecentKeywords';
import RecommendedKeywords from './RecommendedKeywords';
import SectionTitle from './SectionTitle';

/**
 * 검색 전 화면. web: widgets/search/ui/InitialResult.tsx
 * (최근 검색어 + 추천 검색어 + '추천 핫딜' 캐러셀).
 *
 * ★캐러셀 데이터는 `TrendingQueries.recommended()` 를 그대로 쓴다 —
 * web 도 검색 초기화면과 발견 탭 랭킹이 같은 쿼리(`communityRandomRankingProducts`
 * count 20 · limit 10)를 쓴다. 같은 queryKey 를 공유하니 발견 탭을 이미 봤으면
 * 캐시에서 즉시 뜬다.
 */
export default function SearchInitial({
  recentKeywords,
  onSelectKeyword,
  onRemoveKeyword,
  onClearKeywords,
  onPressProduct,
  bottomInset,
}: {
  recentKeywords: string[];
  onSelectKeyword: (keyword: string) => void;
  onRemoveKeyword: (keyword: string) => void;
  onClearKeywords: () => void;
  onPressProduct: (id: number) => void;
  bottomInset: number;
}) {
  const {data: hotDeals} = useQuery(TrendingQueries.recommended());

  return (
    <ScrollView
      className="flex-1 bg-white"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.content,
        {paddingBottom: 24 + bottomInset},
      ]}>
      <RecentKeywords
        keywords={recentKeywords}
        onSelect={onSelectKeyword}
        onRemove={onRemoveKeyword}
        onClearAll={onClearKeywords}
      />
      <RecommendedKeywords onSelect={onSelectKeyword} />

      <View style={styles.section}>
        <SectionTitle title="추천 핫딜" />
        {hotDeals && hotDeals.length > 0 ? (
          <CarouselList products={hotDeals} onPressProduct={onPressProduct} />
        ) : (
          // web 과 같은 이유로 빈 공간 대신 스켈레톤을 둔다 — 화면 구조가
          // 유지돼야 로딩이 "덜 만들어진 화면"으로 보이지 않는다.
          <CarouselSkeleton />
        )}
      </View>
    </ScrollView>
  );
}

/** web CarouselProductListSkeleton 의 모바일 모양(120px 카드 한 줄). */
function CarouselSkeleton() {
  return (
    <View className="flex-row px-5" style={styles.skeletonRow}>
      {Array.from({length: 3}).map((_, i) => (
        <View key={i} style={styles.skeletonCard}>
          <SkeletonBox style={styles.skeletonThumb} />
          <SkeletonBox style={styles.skeletonTitle} />
          <SkeletonBox style={styles.skeletonPrice} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {paddingTop: 8, gap: 20},
  section: {gap: 8},
  skeletonRow: {gap: 12},
  skeletonCard: {gap: 8},
  skeletonThumb: {
    width: CAROUSEL_CARD_WIDTH,
    height: CAROUSEL_CARD_WIDTH,
    borderRadius: 8,
  },
  skeletonTitle: {width: CAROUSEL_CARD_WIDTH, height: 14, borderRadius: 4},
  skeletonPrice: {width: 72, height: 14, borderRadius: 4},
});
