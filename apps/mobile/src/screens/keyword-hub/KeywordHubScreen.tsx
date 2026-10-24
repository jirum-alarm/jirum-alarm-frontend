import {
  emptyText,
  infoBox,
  linkChip,
  text as textRole,
} from '@jirum/design-system/recipes';
import {
  buildHubModelGroups,
  type HubModelChip,
  type HubModelPageLink,
} from '@jirum/domain/hub-model-pages';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import CurationGrid from '@/entities/home/ui/CurationGrid';
import {GridCard} from '@/entities/home/ui/cards/HomeProductCards';
import type {ProductCardType} from '@/entities/home/model/types';
import {
  buildKeywordHubLead,
  describeKeywordHubRhythm,
  keywordHubPath,
  findThemesForHub,
} from '@/entities/keyword-hub/lib/keyword-hub';
import {useKeywordHub} from '@/entities/keyword-hub/model/useKeywordHub';
import {ThemeQueries} from '@/entities/theme';
import type {TabStackParamList} from '@/shared/lib/navigation/param-list';
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
  // 위층: 이 키워드를 품은 관심사 묶음. 실패·로딩이면 칸만 안 보인다(web 허브 페이지와 같은 규칙).
  const {data: themes} = useQuery(ThemeQueries.themes());
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
  const parentThemes = themes ? findThemesForHub(hub, themes) : [];
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
        <HubModelSection
          hubName={hub.name}
          pages={data.modelPages}
          onOpen={(modelSlug, modelName) =>
            navigation.push(tabStackNavigations.WEBVIEW, {
              uri: `/deals/${encodeURIComponent(modelSlug)}`,
              title: modelName,
            })
          }
        />
      ) : null}

      {parentThemes.length > 0 ? (
        <View className="mt-6">
          <Text className={textRole.subtitle}>비슷한 것까지 묶어서 받기</Text>
          <Text className={cn('mt-0.5', textRole.caption)}>
            {`${hub.name}처럼 비슷한 키워드를 한꺼번에 — 반응 좋은 딜만 하루 최대 3건 알려드려요.`}
          </Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {parentThemes.map(t => (
              <PressableScale
                key={t.id}
                onPress={() =>
                  navigation.push(tabStackNavigations.THEME_DETAIL, {
                    themeId: String(t.id),
                    title: t.name,
                  })
                }
                accessibilityRole="link"
                className={modelChip.box}>
                <Text className={modelChip.text}>
                  {`${t.emoji ? `${t.emoji} ` : ''}${t.name}`}
                </Text>
              </PressableScale>
            ))}
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

/**
 * 「상품별 최저가 모음」 — web 허브와 같은 묶음(@jirum/domain hub-model-pages): 같은 상품 줄(진라면 매운맛·순한맛·컵)은 한 줄,
 * 허브 이름이 말한 브랜드는 빼고, 묶이지 않은 건 몇 개만 펼친다. 예전엔 「오뚜기 진라면 매운맛」… 35개가 같은 칩으로 깔렸다(10/23 web 만 고침).
 * 앱 허브 응답엔 모델 페이지 판정이 없어 «지금 싼» 표시·순서는 빼고 묶음만 같다.
 */
function HubModelSection({
  hubName,
  pages,
  onOpen,
}: {
  hubName: string;
  pages: HubModelPageLink[];
  onOpen: (slug: string, name: string) => void;
}) {
  const [showFolded, setShowFolded] = useState(false);
  const {groups, visible, folded, total} = buildHubModelGroups(
    hubName,
    pages,
    [],
  );
  const chips = (list: HubModelChip[]) => (
    <View className="min-w-0 flex-1 flex-row flex-wrap gap-2">
      {list.map(chip => {
        // 묶음 안 칩은 줄 이름을 뺀 말만 보이지만, 읽어 주는 말·웹뷰 제목은 「진라면 매운맛」.
        const name = chip.prefix ? `${chip.prefix} ${chip.label}` : chip.label;
        return (
          <PressableScale
            key={chip.slug}
            onPress={() => onOpen(chip.slug, name)}
            accessibilityRole="link"
            accessibilityLabel={`${name} 최저가 모음`}
            className={modelChip.box}>
            <Text className={modelChip.text}>{chip.label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
  return (
    <View className="mt-6">
      <View className="flex-row items-baseline justify-between gap-3">
        <Text className={textRole.subtitle}>상품별 최저가 모음</Text>
        <Text className={textRole.caption}>{`${total}개`}</Text>
      </View>
      {groups.length > 0 ? (
        <View className="mt-1">
          {groups.map((group, i) => (
            <View
              key={group.name}
              className={cn(
                'flex-row gap-3 py-2',
                i < groups.length - 1 && 'border-b border-gray-100',
              )}>
              <Text className={cn('w-20 shrink-0 pt-1.5', textRole.label)}>
                {group.name}
              </Text>
              {chips(group.chips)}
            </View>
          ))}
        </View>
      ) : null}
      {groups.length > 0 && visible.length > 0 ? (
        <Text className={cn('mb-2 mt-2', textRole.caption)}>그 밖의 상품</Text>
      ) : null}
      {visible.length > 0 ? (
        <View className={groups.length > 0 ? '' : 'mt-2'}>
          {chips(visible)}
        </View>
      ) : null}
      {folded.length > 0 ? (
        showFolded ? (
          <View className="mt-2">{chips(folded)}</View>
        ) : (
          // 배치는 바깥 View 가 — Pressable 엔 누름 opacity 만(SearchAllLink 와 같은 이유).
          <View className="mt-2 flex-row">
            <Pressable
              onPress={() => setShowFolded(true)}
              accessibilityRole="button"
              hitSlop={8}
              style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
              <Text className={cn('py-1', textRole.muted)}>
                {`${folded.length}개 더 보기 ›`}
              </Text>
            </Pressable>
          </View>
        )
      ) : null}
    </View>
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
