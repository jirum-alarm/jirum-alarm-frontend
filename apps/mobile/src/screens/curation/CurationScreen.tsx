import React, {useCallback, useLayoutEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  curationInfiniteQuery,
  curationSingleQuery,
  HomeQueries,
} from '@/entities/home/api/home.queries';
import {supportsInfinite} from '@/entities/home/lib/curation';
import {
  buildPromotionSections,
  findPromotionSectionById,
} from '@/entities/home/model/promotion-sections';
import type {
  ContentPromotionSection,
  ProductCardType,
} from '@/entities/home/model/types';
import CurationGrid from '@/entities/home/ui/CurationGrid';
import {ChipRow} from '@/entities/home/ui/TossHomeSection';
import {GridCard} from '@/entities/home/ui/cards/HomeProductCards';
import {tabStackNavigations} from '@/shared/constant/navigations';
import type {TabStackParamList} from '@/navigations/tab/types';
import {
  DetailHeaderActions,
  DetailHeaderBackButton,
} from '@/screens/detail/ui/ProductDetailHeader';
import {openSearch} from '@/shared/lib/navigation/search-flow';

/**
 * 더보기(큐레이션) 화면. web: app/(desktop-ready)/curation/[id]
 *
 * ★웹뷰 대신 네이티브로 만든 이유: 웹 페이지를 탭 스택에 끼우니 접합부에서
 * 버그가 계속 났다(URL 이중접두·헤더 중복·탭바 소실·상세 유실 등 5건).
 * 홈과 **같은 데이터·같은 카드**를 쓰므로 화면 껍데기만 있으면 된다.
 *
 * ★queryName 5종 중 3종만 커서 페이지네이션을 지원한다(web 과 동일):
 *   productsByKeyword · products · expiringSoonHotDealProducts → 무한스크롤
 *   hotDealRankingProducts · guestRecommendedHotDeals → 단일 조회
 */

type CurationNavigationProp = NativeStackNavigationProp<TabStackParamList>;

export default function CurationScreen({
  route,
}: {
  route: {params: {sectionId: string; title?: string}};
}) {
  const navigation = useNavigation<CurationNavigationProp>();
  const {sectionId} = route.params;

  // 섹션 구성은 홈과 같은 소스에서 만든다(탭 소스 포함).
  const {data: tabSources, isPending: isTabSourcesPending} = useQuery(
    HomeQueries.tabSources(),
  );
  const section = useMemo(() => {
    const sections = buildPromotionSections({
      communityProviders: tabSources?.communityProviders ?? [],
      mallGroups: tabSources?.mallGroups ?? [],
    });
    return findPromotionSectionById(sections, sectionId);
  }, [tabSources, sectionId]);

  /**
   * 섹션 탭 칩. web CurationContainer 와 같다 — 첫 탭이 기본이고, 탭의
   * variables 를 섹션 variables 위에 덮어 조회한다.
   * ★탭 목록이 늦게 오면(tabSources) 첫 렌더엔 폴백 탭이라 id 가 바뀐다.
   * 그래서 고른 id 가 목록에 없으면 첫 탭으로 떨어뜨린다(state 를 되돌리지 않는다).
   */
  const [pickedTabId, setPickedTabId] = useState<string | undefined>();
  const activeTab =
    section?.tabs?.find(tab => tab.id === pickedTabId) ?? section?.tabs?.[0];
  const activeSection = useMemo<ContentPromotionSection | undefined>(
    () =>
      section && activeTab
        ? {
            ...section,
            dataSource: {
              ...section.dataSource,
              variables: {
                ...section.dataSource.variables,
                ...activeTab.variables,
              },
            },
          }
        : section,
    [section, activeTab],
  );

  /**
   * 상단 바 — 뒤로 · 섹션 제목 · 검색 (web CurationPageHeader 와 같은 구성).
   * 뒤로가기·검색은 상세와 같은 규격 아이콘을 쓴다.
   */
  const title = section?.title ?? '';
  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerLeft: ({canGoBack}) =>
        canGoBack ? (
          <DetailHeaderBackButton onPress={() => navigation.goBack()} />
        ) : null,
      // ⚠️web 헤더엔 공유 버튼이 있다 — 아직 안 옮겼다(ShareSheet 가 sharePath 를 받으므로 붙일 수 있다).
      headerRight: () => (
        <DetailHeaderActions onPressSearch={() => openSearch(navigation)} />
      ),
    });
  }, [navigation, title]);

  const handlePressProduct = useCallback(
    (id: number) => {
      navigation.push(tabStackNavigations.DETAIL, {path: `/products/${id}`});
    },
    [navigation],
  );

  if (!section || !activeSection) {
    // 탭 소스(커뮤니티·쇼핑몰 id)가 아직 오는 중이면 기다린다.
    if (isTabSourcesPending) {
      return (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="small" color="#667085" />
        </View>
      );
    }
    // 없는 id(낡은 딥링크 등). web 은 notFound() — 스피너에 멈춰 두지 않는다.
    return (
      <View className="flex-1 items-center justify-center bg-white px-5">
        <Text className="text-base font-semibold text-gray-900">
          페이지를 찾을 수 없어요
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          종료되었거나 주소가 바뀐 모아보기예요.
        </Text>
      </View>
    );
  }

  // 탭을 바꾸면 목록을 갈아끼운다(스크롤 위치가 이전 탭에서 넘어오지 않게).
  const listKey = `${activeSection.id}-${activeTab?.id ?? ''}`;
  // 칩 줄이 있으면 컨테이너 gap 이 간격을 잡는다(토스 더보기와 같은 규칙).
  const topSpacing = section.tabs?.length ? 'tight' : 'normal';
  const list = supportsInfinite(activeSection.dataSource.queryName) ? (
    <InfiniteList
      key={listKey}
      section={activeSection}
      onPressProduct={handlePressProduct}
      topSpacing={topSpacing}
    />
  ) : (
    <SingleList
      key={listKey}
      section={activeSection}
      onPressProduct={handlePressProduct}
      topSpacing={topSpacing}
    />
  );

  if (!section.tabs?.length) return list;

  return (
    <View className="flex-1 gap-2 bg-white pt-2">
      <ChipRow
        items={section.tabs.map(tab => ({id: tab.id, label: tab.label}))}
        activeId={activeTab?.id ?? ''}
        onSelect={setPickedTabId}
      />
      {list}
    </View>
  );
}

type ListProps = {
  section: ContentPromotionSection;
  onPressProduct: (id: number) => void;
  topSpacing: 'normal' | 'tight';
};

/** 커서 페이지네이션 — web 의 useInView 센티넬을 onEndReached 로 대체. */
function InfiniteList({section, onPressProduct, topSpacing}: ListProps) {
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(curationInfiniteQuery(section));

  const products = useMemo(
    () => (data?.pages ?? []).flat() as ProductCardType[],
    [data?.pages],
  );

  return (
    <CurationGrid
      items={products}
      keyOf={item => String(item.id)}
      renderCard={item => <GridCard product={item} onPress={onPressProduct} />}
      isPending={isPending}
      isError={isError}
      label={section.title}
      onRetry={refetch}
      topSpacing={topSpacing}
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
  );
}

/** 커서를 지원하지 않는 섹션(랭킹·취향저격). web 도 단일 조회다. */
function SingleList({section, onPressProduct, topSpacing}: ListProps) {
  const {data, isPending, isError, refetch} = useQuery(
    curationSingleQuery(section),
  );

  return (
    <CurationGrid
      items={data ?? []}
      keyOf={item => String(item.id)}
      renderCard={item => <GridCard product={item} onPress={onPressProduct} />}
      isPending={isPending}
      isError={isError}
      label={section.title}
      onRetry={refetch}
      topSpacing={topSpacing}
    />
  );
}
