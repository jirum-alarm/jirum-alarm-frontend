import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SystemBars} from 'react-native-edge-to-edge';

import {
  ALL_CATEGORY,
  CategoryQueries,
} from '@/entities/category/category.queries';
import CategoryTabBar from '@/entities/trending/ui/CategoryTabBar';
import LiveList from '@/entities/trending/ui/LiveList';
import RankingList from '@/entities/trending/ui/RankingList';
import TrendingTopTabs from '@/entities/trending/ui/TrendingTopTabs';
import {requestTrendingView, useTrendingView} from './trending-view-store';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {getReservedBottomPx} from '@/navigations/tab/tab-bar-metrics';
import type {TabStackParamList} from '@/navigations/tab/types';
import {ChipRowSkeleton, ListRowsSkeleton} from '@/shared/components/Skeletons';

/**
 * 발견 탭. web: app/(desktop-ready)/trending/{live,ranking}
 *
 * ★ web 은 라우트 두 개(/trending/live · /trending/ranking)로 갈리고 카테고리는
 * `?tab=` 쿼리에 담는다. 앱은 **한 화면 안의 상태**다 — 라우트를 나누면 탭
 * 스택에 화면이 쌓여 뒤로가기가 실시간↔랭킹을 왕복하고, 탭을 다시 누를 때
 * 어느 화면으로 돌아갈지가 흐려진다.
 *
 * ★ web 의 Swiper(카테고리 좌우 스와이프)는 옮기지 않았다. 카테고리마다 슬라이드를
 * 미리 만들어 두는 구조라 목록이 50개인 랭킹에서 메모리·초기 렌더가 비싸고,
 * 네이티브 탭 제스처(스와이프 뒤로가기)와 방향이 겹친다. 칩으로 고른다.
 * ponytail: 스와이프 요구가 실제로 나오면 react-native-pager-view 로 올린다.
 */

type Nav = NativeStackNavigationProp<TabStackParamList>;

export default function TrendingScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [categoryId, setCategoryId] = useState<number>(ALL_CATEGORY.id);

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
    () => [ALL_CATEGORY as {id: number; name: string}, ...(categories ?? [])],
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

  const activeCategoryName =
    allCategories.find(c => c.id === activeCategoryId)?.name ??
    ALL_CATEGORY.name;

  const handlePressProduct = useCallback(
    (id: number) => {
      navigation.push(tabStackNavigations.DETAIL, {path: `/products/${id}`});
    },
    [navigation],
  );

  const reservedBottom = getReservedBottomPx(insets.bottom);

  return (
    <View className="flex-1 bg-white" style={{paddingTop: insets.top}}>
      {/* 흰 배경이라 상태바 글씨는 어둡게. 홈(다크 헤더)과 다르다. */}
      <SystemBars style="dark" hidden={false} />

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
            onSelect={setCategoryId}
          />

          {/*
            ★ key 로 카테고리를 갈아끼운다. 같은 컴포넌트를 유지하면 스크롤
            위치와 노출 dedup 집합이 이전 카테고리에서 넘어와, 새 카테고리
            상단이 "이미 본 것"으로 취급돼 CTR 분모가 빈다.
          */}
          {view === 'live' ? (
            <LiveList
              key={`live-${activeCategoryId}`}
              categoryId={activeCategoryId}
              onPressProduct={handlePressProduct}
              bottomInset={reservedBottom}
            />
          ) : (
            <RankingList
              key={`ranking-${activeCategoryId}`}
              categoryId={activeCategoryId}
              categoryName={activeCategoryName}
              onPressProduct={handlePressProduct}
              bottomInset={reservedBottom}
            />
          )}
        </View>
      )}
    </View>
  );
}
