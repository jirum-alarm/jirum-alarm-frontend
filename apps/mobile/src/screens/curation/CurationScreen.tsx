import React, {useCallback, useLayoutEffect, useMemo} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/elements';
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
import type {ProductCardType} from '@/entities/home/model/types';
import CurationGrid from '@/entities/home/ui/CurationGrid';
import {GridCard} from '@/entities/home/ui/cards/HomeProductCards';
import {tabStackNavigations} from '@/shared/constant/navigations';
import type {TabStackParamList} from '@/navigations/tab/types';
import {
  DetailHeaderActions,
  DetailHeaderTitle,
} from '@/screens/detail/ui/ProductDetailHeader';
import {goTabHome, openSearch} from '@/shared/lib/navigation/search-flow';

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
  const {data: tabSources} = useQuery(HomeQueries.tabSources());
  const section = useMemo(() => {
    const sections = buildPromotionSections({
      communityProviders: tabSources?.communityProviders ?? [],
      mallGroups: tabSources?.mallGroups ?? [],
    });
    return findPromotionSectionById(sections, sectionId);
  }, [tabSources, sectionId]);

  /**
   * 상단 바를 상세 화면과 같은 모양으로 — 로고+부제(왼쪽), 검색·공유(오른쪽).
   * 제목만 있는 기본 헤더보다 앱 안이라는 게 분명하고, 상세로 들어갔다
   * 나올 때 헤더가 바뀌지 않아 흐름이 끊기지 않는다.
   */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => null,
      headerLeft: ({tintColor, canGoBack}) => (
        <View className="flex-row items-center">
          {canGoBack ? (
            <HeaderBackButton
              tintColor={tintColor}
              displayMode="minimal"
              onPress={() => navigation.goBack()}
            />
          ) : null}
          <DetailHeaderTitle onPress={() => goTabHome(navigation)} />
        </View>
      ),
      // ★공유는 뺀다. ShareSheet 는 productId 전용이라 목록엔 맞지 않는다.
      headerRight: () => (
        <DetailHeaderActions onPressSearch={() => openSearch(navigation)} />
      ),
    });
  }, [navigation]);

  const handlePressProduct = useCallback(
    (id: number) => {
      navigation.push(tabStackNavigations.DETAIL, {path: `/products/${id}`});
    },
    [navigation],
  );

  if (!section) {
    // 섹션 목록이 아직 안 왔거나 없는 id.
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="small" color="#667085" />
      </View>
    );
  }

  return supportsInfinite(section.dataSource.queryName) ? (
    <InfiniteList section={section} onPressProduct={handlePressProduct} />
  ) : (
    <SingleList section={section} onPressProduct={handlePressProduct} />
  );
}

type ListProps = {
  section: NonNullable<ReturnType<typeof findPromotionSectionById>>;
  onPressProduct: (id: number) => void;
};

/** 커서 페이지네이션 — web 의 useInView 센티넬을 onEndReached 로 대체. */
function InfiniteList({section, onPressProduct}: ListProps) {
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
function SingleList({section, onPressProduct}: ListProps) {
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
    />
  );
}
