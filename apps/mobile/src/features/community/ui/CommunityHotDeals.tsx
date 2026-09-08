import React, {useCallback, useMemo} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {CommunityQueries} from '@/entities/community';
import {GridCard} from '@/entities/home/ui/cards/HomeProductCards';
import {navigateToNativeRoute} from '@/navigations/navigation-ref';
import type {TabStackParamList} from '@/navigations/tab/types';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {tabStackNavigations} from '@/shared/constant/navigations';

type Nav = NativeStackNavigationProp<TabStackParamList>;

type RankingOption = {
  id: string;
  label: string;
  type: 'hotdeal' | 'ranking';
  categoryId: number | null;
  link: string;
};

/**
 * web `CommunityHotDeals` 의 RANKING_OPTIONS 와 **같은 순서·라벨·링크**.
 * 날짜로 고르므로 순서가 어긋나면 웹과 앱이 같은 날 다른 섹션을 보여준다.
 */
export const RANKING_OPTIONS: RankingOption[] = [
  {
    id: 'hotdeal',
    label: '지금 인기 핫딜',
    type: 'hotdeal',
    categoryId: null,
    link: '/curation/hotdeal',
  },
  {
    id: 'ranking-all',
    label: '전체 랭킹',
    type: 'ranking',
    categoryId: null,
    link: '/trending/ranking',
  },
  {
    id: 'ranking-2',
    label: "'생활·식품' 인기 상품",
    type: 'ranking',
    categoryId: 2,
    link: '/trending/ranking?tab=2',
  },
  {
    id: 'ranking-1',
    label: "'컴퓨터' 인기 상품",
    type: 'ranking',
    categoryId: 1,
    link: '/trending/ranking?tab=1',
  },
];

/** web `getDailyOptionIndex` — 날짜 기반이라 하루 동안 값이 안 바뀐다. */
export function getDailyOptionIndex(date: Date = new Date()): number {
  return date.getDate() % RANKING_OPTIONS.length;
}

/**
 * 커뮤니티 목록 아래 붙는 핫딜/랭킹 6개. web `features/community/ui/CommunityHotDeals`.
 *
 * ★카드는 홈의 `GridCard` 를 그대로 쓴다(새로 만들지 않는다).
 * web 의 이 섹션 카드는 제목·가격만 보여주는 축소판이지만, 앱에서 같은 상품이
 * 화면마다 다른 카드로 보이는 쪽이 더 어색하다.
 */
export default function CommunityHotDeals() {
  const navigation = useNavigation<Nav>();
  const option = useMemo(() => RANKING_OPTIONS[getDailyOptionIndex()], []);

  const {data, isPending, isError, refetch} = useQuery(
    CommunityQueries.hotDeals(option),
  );

  const products = data ?? [];

  const handlePressProduct = useCallback(
    (id: number) => {
      navigation.push(tabStackNavigations.DETAIL, {path: `/products/${id}`});
    },
    [navigation],
  );

  /**
   * 더보기. **판정은 `resolveNativeRoute` 한 곳에서** 한다 —
   * `/curation/hotdeal` 은 네이티브 큐레이션 화면, `/trending/ranking` 은
   * 발견 탭(랭킹)으로 간다. 네이티브가 못 그리는 경로만 웹뷰로 떨어진다.
   *
   * ⚠️ `?tab=2` 같은 카테고리는 그 판정기가 아직 안 옮긴다 — 랭킹의 '전체'로
   * 열린다(카테고리까지 살리려면 tab-routing 에 파라미터를 실어야 한다).
   */
  const handlePressMore = useCallback(() => {
    if (navigateToNativeRoute(option.link)) return;
    navigation.push(tabStackNavigations.WEBVIEW, {
      uri: option.link,
      title: option.label,
    });
  }, [navigation, option]);

  // 데이터가 없으면 섹션 자체를 숨긴다(web: products.length === 0 → null).
  if (!isError && !isPending && products.length === 0) return null;

  return (
    <View className="mt-2 border-t border-gray-100 pt-4">
      <View className="flex-row items-center justify-between px-5 pb-3">
        <Text className="text-sm font-semibold text-gray-900">
          {option.label}
        </Text>
        <Pressable
          onPress={handlePressMore}
          accessibilityRole="button"
          accessibilityLabel={`${option.label} 더보기`}
          hitSlop={8}
          style={({pressed}) => (pressed ? {opacity: 0.6} : null)}>
          <Text className="text-xs text-gray-500">더보기</Text>
        </Pressable>
      </View>

      {isError ? (
        <SectionErrorRow label={option.label} onRetry={refetch} />
      ) : isPending ? (
        <View className="h-24 items-center justify-center">
          <ActivityIndicator size="small" color="#667085" />
        </View>
      ) : (
        <View
          className="flex-row flex-wrap px-5 pb-4"
          // web: grid-cols-3 gap-x-2 gap-y-3
          style={styles.grid}>
          {products.map(product => (
            <View key={String(product.id)} style={styles.gridCell}>
              <GridCard
                product={product}
                onPress={handlePressProduct}
                showTime={false}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {gap: 8},
  /** 3열. gap 8 두 칸을 빼고 나눈 값. */
  gridCell: {width: '31%'},
});
