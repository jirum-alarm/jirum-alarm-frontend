import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SystemBars} from 'react-native-edge-to-edge';

import {
  ALL_CATEGORY,
  CategoryQueries,
  type CategoryItem,
} from '@/entities/category/category.queries';
import {TrendingQueries} from '@/entities/trending/api/trending.queries';
import CategoryPager from '@/entities/trending/ui/CategoryPager';
import CategoryTabBar from '@/entities/trending/ui/CategoryTabBar';
import LiveList from '@/entities/trending/ui/LiveList';
import RankingList from '@/entities/trending/ui/RankingList';
import TrendingTopTabs from '@/entities/trending/ui/TrendingTopTabs';
import {
  requestTrendingCategory,
  requestTrendingView,
  useTrendingCategory,
  useTrendingView,
} from '@/shared/lib/navigation/trending-view-store';
import {orderTrendingCategories} from './trending-tab-order';
import {Analytics} from '@/shared/lib/analytics/ga4';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {getReservedBottomPx} from '@/navigations/tab/tab-bar-metrics';
import type {TabStackParamList} from '@/shared/lib/navigation/param-list';
import {
  ChipRowSkeleton,
  GridSkeleton,
  ListRowsSkeleton,
} from '@/shared/components/Skeletons';

/**
 * 발견 탭. web: app/(desktop-ready)/trending/{live,ranking}
 *
 * ★ web 은 라우트 두 개(/trending/live · /trending/ranking)로 갈리고 카테고리는
 * `?tab=` 쿼리에 담는다. 앱은 **한 화면 안의 상태**다 — 라우트를 나누면 탭
 * 스택에 화면이 쌓여 뒤로가기가 실시간↔랭킹을 왕복하고, 탭을 다시 누를 때
 * 어느 화면으로 돌아갈지가 흐려진다.
 *
 * ★ 카테고리는 칩으로도, web Swiper 처럼 본문을 좌우로 밀어서도 고른다(2026-10-13 사용자 요청).
 * 페이저(CategoryPager)는 보고 있는 페이지의 목록 하나만 그린다 — 이유는 그 파일 주석.
 * 발견 탭 루트라 스택 뒤로가기 스와이프와 겹치지 않는다.
 */

type Nav = NativeStackNavigationProp<TabStackParamList>;

export default function TrendingScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  // 카테고리도 store 가 정본 — 밖(`/trending/ranking?tab=N`)에서 지정할 수 있어야 한다.
  const categoryId = useTrendingCategory();

  /**
   * 지금 보여줄 화면.
   *
   * ★ useState 로 갖지 않는다 — store 가 정본이다. 로컬 state 로 두면 값이 두 곳에
   * 생기고, 탭바(발견 탭 재탭)가 "지금 무엇을 보고 있나"를 알 수 없어
   * 실시간↔랭킹 토글을 만들 수 없다.
   * 웹뷰 시절 injectJavaScript 로 URL 을 밀어 넣던 자리이기도 하다.
   */
  const view = useTrendingView();

  const {
    data: categories,
    isPending,
    isError,
    refetch,
  } = useQuery(CategoryQueries.categoriesForUser());

  // '전체' 는 서버에 없는 합성 카테고리라 맨 앞에 끼운다(web 과 같다).
  const allCategories = useMemo(
    () => [
      ALL_CATEGORY as {id: number; name: string},
      ...orderTrendingCategories(categories ?? []),
    ],
    [categories],
  );

  /**
   * 선호 카테고리를 바꾸면 지금 보던 id 가 목록에서 사라질 수 있다.
   * 그대로 두면 어떤 칩도 활성이 아니고 빈 목록이 뜨므로 '전체'로 떨어뜨린다
   * (web 이 nuqs parse 로 같은 처리를 한다).
   */
  const activeCategoryId = allCategories.some(c => c.id === categoryId)
    ? categoryId
    : ALL_CATEGORY.id;

  // 카테고리 선택 — 순서 판단 근거(web 은 ?tab= page_view 로 잰다). method 로 칩 누름·본문 스와이프를 가른다.
  const selectCategory = useCallback(
    (id: number, method: 'tap' | 'swipe') => {
      if (id !== activeCategoryId) {
        Analytics.track('trending_category_select', {
          category_id: id,
          position: allCategories.findIndex(c => c.id === id), // 0 = 전체
          view,
          method,
        });
      }
      requestTrendingCategory(id);
    },
    [activeCategoryId, allCategories, view],
  );
  const handleSelectCategory = useCallback(
    (id: number) => selectCategory(id, 'tap'),
    [selectCategory],
  );
  const handleSwipeCategory = useCallback(
    (id: number) => selectCategory(id, 'swipe'),
    [selectCategory],
  );

  // 끌기 시작하면 양옆 카테고리를 미리 받는다 — 손을 떼면 스켈레톤 없이 바로 채워진다.
  const queryClient = useQueryClient();
  const prefetchNeighbors = useCallback(
    (ids: number[]) => {
      for (const id of ids) {
        if (view === 'live') {
          queryClient.prefetchInfiniteQuery(TrendingQueries.live(id));
        } else {
          queryClient.prefetchQuery(TrendingQueries.ranking(id));
          queryClient.prefetchQuery(TrendingQueries.rankingLive(id));
        }
      }
    },
    [queryClient, view],
  );

  const handlePressProduct = useCallback(
    (id: number) => {
      navigation.push(tabStackNavigations.DETAIL, {path: `/products/${id}`});
    },
    [navigation],
  );

  const reservedBottom = getReservedBottomPx(insets.bottom);

  /*
    ★ key 로 카테고리를 갈아끼운다. 같은 컴포넌트를 유지하면 스크롤
    위치와 노출 dedup 집합이 이전 카테고리에서 넘어와, 새 카테고리
    상단이 "이미 본 것"으로 취급돼 CTR 분모가 빈다.
  */
  const renderPage = useCallback(
    (category: CategoryItem) =>
      view === 'live' ? (
        <LiveList
          key={`live-${category.id}`}
          categoryId={category.id}
          onPressProduct={handlePressProduct}
          bottomInset={reservedBottom}
        />
      ) : (
        <RankingList
          key={`ranking-${category.id}`}
          categoryId={category.id}
          categoryName={category.name}
          onPressProduct={handlePressProduct}
          bottomInset={reservedBottom}
        />
      ),
    [view, handlePressProduct, reservedBottom],
  );

  return (
    <View className="flex-1 bg-white" style={{paddingTop: insets.top}}>
      {/* 흰 배경이라 상태바 글씨는 어둡게. 홈(다크 헤더)과 다르다. */}
      <SystemBars style="auto" hidden={false} />

      {/* web TrendingPageHeader — h1 은 sr-only 라 화면엔 탭만 보인다. */}
      <TrendingTopTabs active={view} onSelect={requestTrendingView} />

      {isPending ? (
        // 빈 화면 + 점 하나 대신 실제 골격(카테고리 칩 + 상품 행)을 그린다.
        <View className="flex-1" style={{gap: 8, paddingTop: 12}}>
          <ChipRowSkeleton />
          <ListRowsSkeleton />
        </View>
      ) : isError ? (
        <View className="flex-1 pt-4">
          <SectionErrorRow label="카테고리" onRetry={refetch} />
        </View>
      ) : (
        <View className="flex-1" style={{gap: 8, paddingTop: 12}}>
          <CategoryTabBar
            categories={allCategories}
            activeId={activeCategoryId}
            onSelect={handleSelectCategory}
          />

          <CategoryPager
            categories={allCategories}
            activeId={activeCategoryId}
            onSwipeTo={handleSwipeCategory}
            onDragStart={prefetchNeighbors}
            renderPage={renderPage}
            renderPlaceholder={renderPagePlaceholder}
          />
        </View>
      )}
    </View>
  );
}

const renderPagePlaceholder = () => <GridSkeleton />;
