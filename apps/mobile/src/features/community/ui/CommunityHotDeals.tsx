import {
  COMMUNITY_HOT_DEAL_OPTIONS,
  dailyHotDealOptionIndex,
} from '@jirum/domain/community';
import React, {useCallback, useMemo} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {useQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {CommunityQueries} from '@/entities/community';
import {GridCard} from '@/entities/home/ui/cards/HomeProductCards';
import {navigateToNativeRoute} from '@/shared/lib/navigation/navigation-ref';
import type {TabStackParamList} from '@/shared/lib/navigation/param-list';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {text} from '@jirum/design-system/recipes';

type Nav = NativeStackNavigationProp<TabStackParamList>;

/** 섹션 후보·오늘(KST) 고르기 — 정본 @jirum/domain/community(web 과 같은 날 같은 섹션). */
export const RANKING_OPTIONS = COMMUNITY_HOT_DEAL_OPTIONS;
export const getDailyOptionIndex = dailyHotDealOptionIndex;

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
   * 더보기.
   * - 핫딜(`/curation/hotdeal`) → **이 탭(커뮤니티) 스택에** 큐레이션을 쌓는다.
   *   `resolveNativeRoute` 는 `/curation/*` 을 홈 탭에 귀속시키므로(딥링크 규칙),
   *   그걸 타면 커뮤니티에서 누른 더보기가 홈 탭으로 튕긴다 — web 은 같은 자리에서
   *   페이지만 바뀐다. CURATION 은 모든 탭 스택에 등록돼 있다(TabStackNavigator).
   * - 랭킹(`/trending/ranking?tab=N`) → 발견 탭 랭킹의 **그 카테고리**
   *   (판정·카테고리 파싱은 `resolveNativeRoute`).
   * 네이티브가 못 그리는 경로만 웹뷰로 떨어진다.
   */
  const handlePressMore = useCallback(() => {
    const curationId = option.link.match(/^\/curation\/([^/?#]+)/)?.[1];
    if (curationId) {
      navigation.push(tabStackNavigations.CURATION, {sectionId: curationId});
      return;
    }
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
        <Text className={text.label}>{option.label}</Text>
        <Pressable
          onPress={handlePressMore}
          accessibilityRole="button"
          accessibilityLabel={`${option.label} 더보기`}
          hitSlop={12}
          style={({pressed}) => (pressed ? {opacity: 0.6} : null)}>
          <Text className={text.caption}>더보기</Text>
        </Pressable>
      </View>

      {isError ? (
        <SectionErrorRow label={option.label} onRetry={refetch} />
      ) : isPending ? (
        <View className="h-24 items-center justify-center">
          <ActivityIndicator size="small" className="text-gray-500" />
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
