import React, {useCallback, useLayoutEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {HomeQueries, tossInfiniteQuery} from '@/entities/home/api/home.queries';
import {toTossDeal, tossDetailPath} from '@/entities/home/lib/toss';
import CurationGrid from '@/entities/home/ui/CurationGrid';
import TossDealCard from '@/entities/home/ui/cards/TossDealCard';
import {ChipRow, TOSS_SECTIONS} from '@/entities/home/ui/TossHomeSection';
import {
  DetailHeaderActions,
  DetailHeaderBackButton,
  DetailHeaderTitle,
} from '@/screens/detail/ui/ProductDetailHeader';
import ShareSheet from '@/screens/detail/ui/ShareSheet';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {goTabHome, openSearch} from '@/shared/lib/navigation/search-flow';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import type {TabStackParamList} from '@/shared/lib/navigation/param-list';

/**
 * 토스 특가 더보기. web: app/(desktop-ready)/toss
 *
 * ★홈의 TossHomeSection 과 카드·탭·변환 로직을 공유하고, 그리드 껍데기는
 * 큐레이션과 공유한다(CurationGrid). 화면이 하는 일은 "섹션 탭 + 무한스크롤"뿐.
 *
 * ★카드는 큐레이션과 공유하지 않는다 — 토스는 `data.toss` 전용 카드다.
 * 코너에서는 판매가를 숨기고 상세는 ?from=toss 로 연다.
 */

const CATEGORY_SECTION_ID = 'category';

type Nav = NativeStackNavigationProp<TabStackParamList>;

export default function TossCurationScreen({
  route,
}: {
  route: {params: {sectionId?: string}};
}) {
  const navigation = useNavigation<Nav>();
  const bottomClip = useHiddenTabBarClipPadding();
  const [activeId, setActiveId] = useState<string>(
    route.params?.sectionId ?? TOSS_SECTIONS[0].id,
  );
  const [activeCat, setActiveCat] = useState<string | undefined>(undefined);
  const isCategory = activeId === CATEGORY_SECTION_ID;

  // 상세와 같은 헤더(로고+부제·검색·공유). 공유는 web 토스 특가 헤더와 같은 `/toss`.
  const [shareOpen, setShareOpen] = useState(false);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => null,
      headerLeft: ({canGoBack}) => (
        <View className="flex-row items-center">
          {canGoBack ? (
            <DetailHeaderBackButton onPress={() => navigation.goBack()} />
          ) : null}
          <DetailHeaderTitle onPress={() => goTabHome(navigation)} />
        </View>
      ),
      headerRight: () => (
        <DetailHeaderActions
          onPressSearch={() => openSearch(navigation)}
          onPressShare={() => setShareOpen(true)}
        />
      ),
    });
  }, [navigation]);

  const {data: categoryLabels = []} = useQuery({
    ...HomeQueries.tossLabels(),
    enabled: isCategory,
  });
  const cat = isCategory ? activeCat ?? categoryLabels[0] : undefined;

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...tossInfiniteQuery(activeId, cat ?? null),
    enabled: !isCategory || !!cat,
  });

  const deals = useMemo(
    () => (data?.pages ?? []).flat().map(toTossDeal),
    [data?.pages],
  );

  const handlePressProduct = useCallback(
    (id: number) => {
      navigation.push(tabStackNavigations.DETAIL, {path: tossDetailPath(id)});
    },
    [navigation],
  );
  // ★고정한다 — 인라인이면 페이지가 붙을 때마다 보이는 카드(3열이라 한 화면 15장 남짓)가 전부 다시 그려졌다.
  const renderCard = useCallback(
    (item: (typeof deals)[number]) => (
      <TossDealCard deal={item} onPress={handlePressProduct} />
    ),
    [handlePressProduct],
  );

  const activeLabel =
    TOSS_SECTIONS.find(s => s.id === activeId)?.label ?? '토스 특가';

  return (
    // gap-2: 칩 줄과 그리드 사이 8px (홈 섹션과 같은 값).
    // ChipRow 는 이제 높이를 고정하므로 자체 여백이 없다.
    <View className="flex-1 gap-2 bg-white pt-2">
      <ChipRow
        items={TOSS_SECTIONS.map(s => ({id: s.id, label: s.label}))}
        activeId={activeId}
        onSelect={id => {
          setActiveId(id);
          setActiveCat(undefined); // 섹션 바꾸면 하위 카테고리 초기화
        }}
      />

      {isCategory && categoryLabels.length > 0 ? (
        <ChipRow
          items={categoryLabels.map(label => ({id: label, label}))}
          activeId={cat ?? ''}
          onSelect={setActiveCat}
          variant="sub"
        />
      ) : null}

      <CurationGrid
        items={deals}
        keyOf={item => item.id}
        renderCard={renderCard}
        columns={3}
        topSpacing="tight"
        bottomInset={bottomClip}
        isPending={isPending}
        isError={isError}
        label={activeLabel}
        onRetry={refetch}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        footer={
          isFetchingNextPage ? (
            <View className="items-center py-6">
              <ActivityIndicator size="small" className="text-gray-500" />
            </View>
          ) : null
        }
      />
      <ShareSheet
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        sharePath="/toss"
        title="토스 특가"
      />
    </View>
  );
}
