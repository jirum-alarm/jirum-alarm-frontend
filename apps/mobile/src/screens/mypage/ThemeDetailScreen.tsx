import {THEME_COPY} from '@jirum/domain/mypage';
import {
  emptyText,
  wordTag,
  text,
  sectionTitle,
} from '@jirum/design-system/recipes';
import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';

import {ThemeQueries} from '@/entities/theme';
import {findKeywordHubForQuery} from '@/entities/keyword-hub/lib/keyword-hub';
import {useKeywordHubs} from '@/entities/keyword-hub/model/useKeywordHubs';
import {ListCard} from '@/entities/home/ui/cards/HomeProductCards';
import type {ProductCardType} from '@/entities/home/model/types';
import type {TabStackParamList} from '@/shared/lib/navigation/param-list';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import {usePullRefresh} from '@/shared/hooks/usePullRefresh';
import {tick} from '@/shared/lib/feedback';
import StackHeader from '@/features/mypage/ui/StackHeader';
import Button from '@/shared/components/ui/Button';
import {useThemeSubscription} from '@/features/mypage/model/useThemeSubscription';
import type {ThemeWithKeywords} from '@/shared/api/theme';
import {cn} from '@/shared/lib/styling';
import PressableOpacity from '@/shared/components/PressableOpacity';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.THEME_DETAIL
>;

/**
 * 묶음 상세 + 지금 뜬 딜. web `/themes/[id]`(ThemeDetail).
 *
 * ★카드는 `ListCard`(= web `ListProductCard`) 를 그대로 쓴다 — web 과 같은 카드다.
 * ★web 의 PC 분기(`!isMobile` 2열 그리드 · 헤더 옆 인라인 버튼)는 안 옮긴다.
 */
export default function ThemeDetailScreen({route, navigation}: Props) {
  const bottomClip = useHiddenTabBarClipPadding();
  const themeId = Number(route.params.themeId);

  const {
    data: themes,
    isPending: isThemesPending,
    isError: isThemesError,
    refetch: refetchThemes,
  } = useQuery(ThemeQueries.themes());
  const {data: subscribedIds} = useQuery(ThemeQueries.mySubscribedIds());
  const {
    data: deals,
    isPending: isDealsPending,
    isError: isDealsError,
    refetch: refetchDeals,
  } = useQuery(ThemeQueries.liveDeals(themeId));
  const {
    subscribe,
    unsubscribe,
    isPending: isMutating,
  } = useThemeSubscription();

  const theme = (themes ?? []).find(item => Number(item.id) === themeId);
  const isSubscribed = new Set(subscribedIds ?? []).has(themeId);

  // 허브가 있는 키워드 칩 → 허브 화면(테마 → 키워드 → 딜 한 층씩). web ThemeDetail 과 짝.
  const openHub = useCallback(
    (hub: {slug: string; name: string}) => {
      navigation.push(tabStackNavigations.KEYWORD_HUB, {
        slug: hub.slug,
        name: hub.name,
      });
    },
    [navigation],
  );
  const openDetail = useCallback(
    (id: number) => {
      navigation.push(tabStackNavigations.DETAIL, {path: `/products/${id}`});
    },
    [navigation],
  );

  const contentStyle = [styles.content, {paddingBottom: 40 + bottomClip}];

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchThemes(), refetchDeals()]);
  }, [refetchDeals, refetchThemes]);
  // isRefetching 에 묶으면 앱 복귀 때의 조용한 갱신에도 위에서 스피너가 돈다 — 당길 때만.
  const {refreshing, onRefresh} = usePullRefresh(refetchAll);

  return (
    <View className="flex-1 bg-white">
      {/*
        ★목록 화면도 "알림 묶음" 이라 같은 제목이면 목록/상세가 구분되지 않는다.
        묶음이 아직 안 왔을 때만 총칭으로 떨어진다.
      */}
      <StackHeader
        title={theme?.name ?? '관심사별 핫딜 알림'}
        onBack={navigation.goBack}
      />
      {isThemesError ? (
        <View className="pt-4">
          <SectionErrorRow label="관심사" onRetry={refetchThemes} />
        </View>
      ) : isThemesPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" className="text-gray-500" />
        </View>
      ) : !theme ? (
        // web 은 `if (!theme) return null` 로 빈 화면을 내보낸다. 앱은 왜 비었는지
        // 알려준다 — 딥링크가 없어진 묶음 id 를 들고 올 수 있다.
        <View className="flex-1 items-center justify-center px-10">
          <Text className={cn('text-center', emptyText)}>
            없는 관심사이거나 지금은 볼 수 없어요.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={contentStyle}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {/* 헤더 — 이모지 + 이름 + 설명 */}
          <View className="flex-row items-start gap-2">
            {theme.emoji ? (
              <Text className="text-2xl">{theme.emoji}</Text>
            ) : null}
            <View style={styles.grow}>
              <Text className={sectionTitle.page}>{theme.name}</Text>
              <Text className={cn(text.muted, 'mt-1')}>
                {theme.description}
              </Text>
            </View>
          </View>

          {/* 구독 토글 — 헤더 바로 아래 전체폭(web 모바일과 같은 위치) */}
          <Button
            onPress={() => {
              tick();
              if (isSubscribed) unsubscribe(themeId);
              else subscribe(themeId);
            }}
            loading={isMutating}
            color={isSubscribed ? 'secondary' : 'primary'}
            className="mt-4"
            accessibilityLabel={isSubscribed ? '알림 끄기' : '알림 받기'}>
            {isSubscribed ? THEME_COPY.subscribedToggle : '알림 받기'}
          </Button>
          <Text className={cn(text.caption, 'mt-2')}>
            키워드를 하나하나 등록하지 않아도, 반응 좋은 딜만 하루 최대 3건
            보내드려요.
          </Text>

          {/* 고르는 조건 — web ThemeDetail 의 ThemeConditions */}
          <View className="mt-6">
            <Text className="mb-0.5 text-sm font-medium text-gray-900">
              {THEME_COPY.criteriaTitle}
            </Text>
            <Text className={cn(text.caption, 'mb-2')}>
              딜이 뜰 때마다 울리는 게 아니라, 아래 조건을 다 통과한 딜만 와요.
            </Text>
            <ThemeConditions theme={theme} onOpenHub={openHub} />
          </View>

          {/* 라이브 딜 */}
          <View className="mt-7">
            <Text className="mb-3 text-sm font-medium text-gray-900">
              {'🔥 지금 이 관심사에 뜬 딜 '}
              <Text className="text-primary-800">{deals?.length ?? 0}</Text>
            </Text>
            {isDealsError ? (
              <SectionErrorRow label="라이브 딜" onRetry={refetchDeals} />
            ) : isDealsPending ? (
              <View className="items-center py-8">
                <ActivityIndicator size="small" className="text-gray-500" />
              </View>
            ) : (deals ?? []).length === 0 ? (
              <Text className={cn('py-8 text-center', emptyText)}>
                지금은 뜬 딜이 없어요.
              </Text>
            ) : (
              <View className="gap-4">
                {(deals ?? []).map(deal => (
                  <ListCard
                    key={deal.id}
                    product={deal as ProductCardType}
                    onPress={openDetail}
                    trackingSource="notification_theme"
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// 처음엔 이만큼만 칩으로 보여주고 나머지는 "더 보기".
const KEYWORD_PREVIEW_COUNT = 12;

/**
 * 관심사 알림이 딜을 고르는 조건. web `ThemeDetail` 의 ThemeConditions 와 같은 문구다.
 * 숫자는 crawling-server 발송 배치와 같아야 한다 — THEME_MIN_SCORE(상위 ~7%)·
 * THEME_SLOTS_PER_DAY(3)·크론 KST 10·14·20시(util/pick-theme-deals.ts).
 */
function ThemeConditions({
  theme,
  onOpenHub,
}: {
  theme: ThemeWithKeywords;
  onOpenHub: (hub: {slug: string; name: string}) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const {data: hubs} = useKeywordHubs();
  const keywords = theme.keywords.length
    ? theme.keywords
    : theme.representativeKeywords;
  const visible = showAll ? keywords : keywords.slice(0, KEYWORD_PREVIEW_COUNT);
  const hidden = keywords.length - visible.length;

  return (
    <View className="rounded-xl border border-gray-100">
      <ConditionRow
        first
        icon="🔎"
        title={THEME_COPY.criteriaKeywords(keywords.length)}>
        <View className="mt-2 flex-row flex-wrap gap-1.5">
          {visible.map(keyword => {
            const hub = hubs
              ? findKeywordHubForQuery(keyword, hubs)
              : undefined;
            return hub ? (
              <PressableOpacity
                key={keyword}
                onPress={() => onOpenHub(hub)}
                accessibilityRole="link"
                accessibilityLabel={`${hub.name} 핫딜 보기`}
                hitSlop={4}
                className={cn(wordTag.box, wordTag.tone.fill.box)}>
                <Text className={cn(wordTag.text, wordTag.tone.fill.text)}>
                  {keyword} ›
                </Text>
              </PressableOpacity>
            ) : (
              <View
                key={keyword}
                className={cn(wordTag.box, wordTag.tone.fill.box)}>
                <Text className={cn(wordTag.text, wordTag.tone.fill.text)}>
                  {keyword}
                </Text>
              </View>
            );
          })}
          {hidden > 0 ? (
            <PressableOpacity
              onPress={() => setShowAll(true)}
              accessibilityRole="button"
              hitSlop={6}
              className={cn(wordTag.box, wordTag.tone.more.box)}>
              <Text className={cn(wordTag.text, wordTag.tone.more.text)}>
                +{hidden}개 더 보기
              </Text>
            </PressableOpacity>
          ) : null}
        </View>
      </ConditionRow>
      <ConditionRow icon="🔥" title="반응 좋은 딜만">
        <ConditionText>{THEME_COPY.criteriaQuality}</ConditionText>
      </ConditionRow>
      <ConditionRow icon="⏰" title="하루 최대 3건">
        <ConditionText>{THEME_COPY.criteriaSchedule}</ConditionText>
      </ConditionRow>
      <ConditionRow icon="🔁" title="받은 딜은 다시 안 보내요">
        <ConditionText>{THEME_COPY.criteriaSkip}</ConditionText>
      </ConditionRow>
      <ConditionRow icon="🧹" title="엉뚱한 딜은 걸러요">
        <ConditionText>{THEME_COPY.criteriaExcludeRoundups}</ConditionText>
        {theme.excludeKeywords.length > 0 ? (
          <>
            <ConditionText>{THEME_COPY.criteriaExcludeWords}</ConditionText>
            <View className="mt-1.5 flex-row flex-wrap gap-1.5">
              {theme.excludeKeywords.map(word => (
                <View
                  key={word}
                  className={cn(wordTag.box, wordTag.tone.struck.box)}>
                  <Text className={cn(wordTag.text, wordTag.tone.struck.text)}>
                    {word}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ConditionRow>
      {theme.weeklyAlertCount > 0 ? (
        <ConditionRow
          icon="📬"
          title={`지난 7일이었다면 ${theme.weeklyAlertCount}건`}>
          <ConditionText>
            이 조건으로 지난 일주일 동안 받았을 알림 수예요.
          </ConditionText>
        </ConditionRow>
      ) : null}
    </View>
  );
}

function ConditionRow({
  first = false,
  icon,
  title,
  children,
}: {
  first?: boolean;
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View
      className={
        first
          ? 'flex-row gap-3 px-4 py-3.5'
          : 'flex-row gap-3 border-t border-gray-100 px-4 py-3.5'
      }>
      <Text className="text-lg">{icon}</Text>
      <View style={styles.grow}>
        <Text className={text.label}>{title}</Text>
        {children}
      </View>
    </View>
  );
}

function ConditionText({children}: {children: React.ReactNode}) {
  return <Text className={cn(text.muted, 'mt-0.5')}>{children}</Text>;
}

const styles = StyleSheet.create({
  content: {paddingHorizontal: 20, paddingTop: 24},
  grow: {flex: 1},
});
