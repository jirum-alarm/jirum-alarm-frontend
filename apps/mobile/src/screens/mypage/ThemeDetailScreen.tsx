import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';

import {ThemeQueries} from '@/entities/theme';
import {ListCard} from '@/entities/home/ui/cards/HomeProductCards';
import type {ProductCardType} from '@/entities/home/model/types';
import type {TabStackParamList} from '@/navigations/tab/types';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import {usePullRefresh} from '@/shared/hooks/usePullRefresh';
import StackHeader from '@/features/mypage/ui/StackHeader';
import Button from '@/shared/components/ui/Button';
import {useThemeSubscription} from '@/features/mypage/model/useThemeSubscription';
import type {ThemeWithKeywords} from '@/shared/api/theme';

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
          <Text className="text-center text-sm text-gray-500">
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
              <Text className="text-lg font-bold text-gray-900">
                {theme.name}
              </Text>
              <Text className="mt-1 text-sm text-gray-500">
                {theme.description}
              </Text>
            </View>
          </View>

          {/* 구독 토글 — 헤더 바로 아래 전체폭(web 모바일과 같은 위치) */}
          <Button
            onPress={() => {
              if (isSubscribed) unsubscribe(themeId);
              else subscribe(themeId);
            }}
            loading={isMutating}
            color={isSubscribed ? 'secondary' : 'primary'}
            className="mt-4"
            accessibilityLabel={isSubscribed ? '알림 끄기' : '알림 받기'}>
            {isSubscribed ? '알림 받는 중 · 끄기' : '알림 받기'}
          </Button>
          <Text className="mt-2 text-xs text-gray-500">
            키워드를 하나하나 등록하지 않아도, 반응 좋은 딜만 하루 최대 3건
            보내드려요.
          </Text>

          {/* 고르는 조건 — web ThemeDetail 의 ThemeConditions */}
          <View className="mt-6">
            <Text className="mb-0.5 text-sm font-medium text-gray-900">
              이렇게 골라서 보내드려요
            </Text>
            <Text className="mb-2 text-xs text-gray-500">
              딜이 뜰 때마다 울리는 게 아니라, 아래 조건을 다 통과한 딜만 와요.
            </Text>
            <ThemeConditions theme={theme} />
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
              <Text className="py-8 text-center text-sm text-gray-500">
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
function ThemeConditions({theme}: {theme: ThemeWithKeywords}) {
  const [showAll, setShowAll] = useState(false);
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
        title={`키워드 ${keywords.length}개 중 하나라도 제목에 있으면`}>
        <View className="mt-2 flex-row flex-wrap gap-1.5">
          {visible.map(keyword => (
            <Text
              key={keyword}
              className="rounded-md bg-gray-50 px-2.5 py-1 text-xs text-gray-600">
              {keyword}
            </Text>
          ))}
          {hidden > 0 ? (
            <Pressable
              onPress={() => setShowAll(true)}
              accessibilityRole="button"
              hitSlop={6}
              className="rounded-md border border-gray-200 px-2.5 py-1">
              <Text className="text-xs font-medium text-gray-700">
                +{hidden}개 더 보기
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ConditionRow>
      <ConditionRow icon="🔥" title="반응 좋은 딜만">
        <ConditionText>
          조회·추천·댓글이 몰린 커뮤니티 상위 약 7% 딜만 골라요.
        </ConditionText>
      </ConditionRow>
      <ConditionRow icon="⏰" title="하루 최대 3건">
        <ConditionText>
          오전 10시 · 오후 2시 · 오후 8시에 그때 가장 좋은 딜 1건씩.
        </ConditionText>
      </ConditionRow>
      <ConditionRow icon="🔁" title="받은 딜은 다시 안 보내요">
        <ConditionText>
          키워드 알림이나 앞선 시간에 이미 받은 딜은 건너뛰고 다음 딜로.
        </ConditionText>
      </ConditionRow>
      <ConditionRow icon="🧹" title="엉뚱한 딜은 걸러요">
        <ConditionText>
          여러 상품을 늘어놓은 모음 글, 사은품 문구에만 키워드가 걸린 딜은 빼요.
        </ConditionText>
        {theme.excludeKeywords.length > 0 ? (
          <>
            <ConditionText>이런 단어가 들어간 딜도 빼요</ConditionText>
            <View className="mt-1.5 flex-row flex-wrap gap-1.5">
              {theme.excludeKeywords.map(word => (
                <Text
                  key={word}
                  className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-500 line-through">
                  {word}
                </Text>
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
        <Text className="text-sm font-semibold text-gray-900">{title}</Text>
        {children}
      </View>
    </View>
  );
}

function ConditionText({children}: {children: React.ReactNode}) {
  return <Text className="mt-0.5 text-sm text-gray-500">{children}</Text>;
}

const styles = StyleSheet.create({
  content: {paddingHorizontal: 20, paddingTop: 24},
  grow: {flex: 1},
});
