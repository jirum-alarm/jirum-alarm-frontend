import {
  emptyText,
  infoBox,
  linkChip,
  text as textRole,
} from '@jirum/design-system/recipes';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import CurationGrid from '@/entities/home/ui/CurationGrid';
import {GridCard} from '@/entities/home/ui/cards/HomeProductCards';
import type {ProductCardType} from '@/entities/home/model/types';
import {
  buildKeywordHubLead,
  describeKeywordHubRhythm,
  keywordHubPath,
} from '@/entities/keyword-hub/lib/keyword-hub';
import {useKeywordHub} from '@/entities/keyword-hub/model/useKeywordHub';
import type {TabStackParamList} from '@/navigations/tab/types';
import {
  DetailHeaderActions,
  DetailHeaderBackButton,
} from '@/screens/detail/ui/ProductDetailHeader';
import ShareSheet from '@/screens/detail/ui/ShareSheet';
import PressableScale from '@/shared/components/PressableScale';
import {SkeletonBox} from '@/shared/components/Skeletons';
import {Text} from '@/shared/components/ui/Text/AppText';
import {
  searchStackNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import {openSearch} from '@/shared/lib/navigation/search-flow';
import {cn, splitBoxText} from '@/shared/lib/styling';

import KeywordHubAlertButton from './ui/KeywordHubAlertButton';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.KEYWORD_HUB
>;

/** web 한 줄 레시피를 겉(View)·글자(Text)로 — 모델 모음 칩. */
const modelChip = splitBoxText(linkChip);

const keyOf = (item: ProductCardType) => String(item.id);

/**
 * 키워드 허브 — 「삼다수 핫딜」 최근 30일 모음. web `app/(desktop-ready)/keywords/[keyword]/page.tsx` 와 같은 내용·순서
 * (한 줄 소개 → 알림 받기 → 올라오는 리듬 → 상품별 최저가 모음 → 딜 목록 → 전체 검색 결과).
 *
 * 왜 앱에도: 키워드가 제품의 맨 위 단위다 — 사용자가 알림을 거는 단위가 곧 허브고, 모델 페이지(`/deals/{slug}`)는
 * 그 아래 층이다. 푸시를 받는 사람 대부분이 앱 사용자인데 앱엔 허브가 없어 검색 결과 위 요약 한 줄이 전부였다.
 *
 * 들어오는 길: 내 키워드(허브인 키워드의 「핫딜 모아보기」)·검색 결과 위 요약 줄·딥링크 `/keywords/{slug}`.
 * 화면은 루트 스택에 있다 — 검색 스택 안에서 push 해도 부모(루트)로 올라가 처리된다.
 * FAQ·「다른 키워드 핫딜」은 검색 유입(SEO)용이라 앱엔 두지 않는다.
 */
export default function KeywordHubScreen({navigation, route}: Props) {
  const {slug} = route.params;
  const {data, isPending, isError, refetch} = useKeywordHub(slug);
  const hub = data?.hub;
  const name = hub?.name ?? route.params.name ?? '';
  const title = name ? `${name} 핫딜` : '';

  const [shareOpen, setShareOpen] = useState(false);
  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerLeft: ({canGoBack}) =>
        canGoBack ? (
          <DetailHeaderBackButton onPress={() => navigation.goBack()} />
        ) : null,
      headerRight: () => (
        <DetailHeaderActions
          onPressSearch={() => openSearch(navigation)}
          onPressShare={hub ? () => setShareOpen(true) : undefined}
        />
      ),
    });
  }, [navigation, title, hub]);

  const insets = useSafeAreaInsets();
  const bottomClip = useHiddenTabBarClipPadding();
  const bottomInset = insets.bottom + bottomClip;

  const handlePressProduct = useCallback(
    (id: number) => {
      navigation.push(tabStackNavigations.DETAIL, {path: `/products/${id}`});
    },
    [navigation],
  );
  const renderCard = useCallback(
    (item: ProductCardType) => (
      <GridCard
        product={item}
        trackingSource="keyword_hub"
        onPress={handlePressProduct}
      />
    ),
    [handlePressProduct],
  );

  // 허브는 최근 30일 요약이다. 그 전 딜·필터(품절 포함·커뮤니티)는 검색 결과에 있다.
  // 루트 스택의 Search 는 검색 스택(중첩)이라 검색어는 자식 화면 params 로 넣어야 닿는다(내 키워드 화면과 같은 모양).
  const openSearchResults = (keyword: string) =>
    (navigation.push as (name: string, params?: object) => void)(
      tabStackNavigations.SEARCH,
      {screen: searchStackNavigations.HOME, params: {keyword}},
    );

  if (isPending || isError) {
    return (
      <CurationGrid<ProductCardType>
        items={[]}
        keyOf={keyOf}
        renderCard={renderCard}
        isPending={isPending}
        isError={isError}
        label="키워드 핫딜"
        onRetry={refetch}
        header={isPending ? <HubHeaderSkeleton /> : null}
      />
    );
  }

  // 공개 허브가 아닌 slug(낡은 딥링크·목록에서 빠진 키워드). web 은 404 — 같은 단어의 검색 결과로는 이어 준다.
  if (!data || !hub) {
    const query = route.params.name ?? slug;
    return (
      <View className="flex-1 items-center justify-center bg-white px-5">
        <Text className={textRole.subtitle}>페이지를 찾을 수 없어요</Text>
        <Text className={cn('mt-2 text-center', textRole.muted)}>
          모아 보는 키워드에서 빠졌거나 주소가 바뀌었어요.
        </Text>
        <SearchAllLink
          keyword={query}
          onPress={() => openSearchResults(query)}
        />
      </View>
    );
  }

  const deals: ProductCardType[] = data.deals;
  const rhythm = describeKeywordHubRhythm(hub);
  const header = (
    <View className="px-5 pb-2 pt-4">
      <Text className={cn('leading-relaxed', textRole.body)}>
        {buildKeywordHubLead(hub)}
      </Text>
      <View className="mt-4">
        <KeywordHubAlertButton keyword={hub.name} />
      </View>

      {rhythm ? (
        <View
          className={cn('mt-4 px-4 py-3', infoBox)}
          accessibilityLabel={`${hub.name} 핫딜이 올라오는 리듬`}>
          <Text className={textRole.label}>{rhythm.headline}</Text>
          {rhythm.sources ? (
            <Text className={cn('mt-0.5', textRole.caption)}>
              {`주로 올라오는 곳 · ${rhythm.sources}`}
            </Text>
          ) : null}
          <Text className={cn('mt-1.5', textRole.body)}>{rhythm.advice}</Text>
        </View>
      ) : null}

      {data.modelPages.length > 0 ? (
        // 같은 키워드 안에서도 상품이 갈린다(삼다수 2L·500ml). 상품별 가격 비교는 모델 페이지(web)가 한다 —
        // 허브에서 가격을 섞어 비교하지 않는 대신 그쪽으로 보낸다. 앱엔 모델 페이지 화면이 없어 웹뷰로 연다.
        <View className="mt-6">
          <Text className={textRole.subtitle}>상품별 최저가 모음</Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {data.modelPages.map(page => {
              const label = [page.brand?.trim(), page.modelName]
                .filter(Boolean)
                .join(' ');
              return (
                <PressableScale
                  key={page.slug}
                  onPress={() =>
                    navigation.push(tabStackNavigations.WEBVIEW, {
                      uri: `/deals/${encodeURIComponent(page.slug)}`,
                      title: label,
                    })
                  }
                  accessibilityRole="link"
                  accessibilityLabel={`${label} 최저가 모음`}
                  className={modelChip.box}>
                  <Text className={modelChip.text}>{label}</Text>
                </PressableScale>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
  const searchAll = (
    <SearchAllLink
      keyword={hub.name}
      onPress={() => openSearchResults(hub.name)}
    />
  );
  const shareSheet = (
    <ShareSheet
      visible={shareOpen}
      onClose={() => setShareOpen(false)}
      sharePath={keywordHubPath(hub)}
      title={title}
    />
  );

  if (deals.length === 0) {
    return (
      <>
        <ScrollView
          className="flex-1 bg-white"
          contentContainerStyle={{paddingBottom: 16 + bottomInset}}>
          {header}
          <View className="items-center py-10">
            <Text className={emptyText}>
              {`최근 올라온 ${hub.name} 핫딜이 없어요.`}
            </Text>
          </View>
          {searchAll}
        </ScrollView>
        {shareSheet}
      </>
    );
  }

  return (
    <>
      <CurationGrid
        items={deals}
        keyOf={keyOf}
        renderCard={renderCard}
        isPending={false}
        isError={false}
        label="키워드 핫딜"
        onRetry={refetch}
        header={header}
        footer={searchAll}
        bottomInset={bottomInset}
      />
      {shareSheet}
    </>
  );
}

/** 「‘삼다수’ 전체 검색 결과 보기」 — web 허브 맨 아래 링크와 같은 문구. */
function SearchAllLink({
  keyword,
  onPress,
}: {
  keyword: string;
  onPress: () => void;
}) {
  return (
    // 배치는 바깥 View 가 — Pressable 엔 누름 opacity 만(className·레이아웃을 같이 주면 NativeWind 가 떨군 적이 있다).
    <View className="mt-6 items-center">
      <Pressable
        onPress={onPress}
        accessibilityRole="link"
        hitSlop={8}
        style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
        <Text className={cn('py-2 underline', textRole.muted)}>
          {`‘${keyword}’ 전체 검색 결과 보기`}
        </Text>
      </Pressable>
    </View>
  );
}

/** 조회 중 머리 — 한 줄 소개·알림 버튼 자리. 아래 카드 골격은 그리드가 그린다. */
function HubHeaderSkeleton() {
  return (
    <View className="gap-2 px-5 pb-2 pt-4">
      <SkeletonBox className="h-3.5 w-11/12 rounded" />
      <SkeletonBox className="h-3.5 w-3/5 rounded" />
      <SkeletonBox className="mt-2 h-12 w-full rounded-lg" />
    </View>
  );
}
