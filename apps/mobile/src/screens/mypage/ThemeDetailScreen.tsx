import React, {useCallback} from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';

import {ThemeQueries} from '@/entities/theme';
import {ListCard} from '@/entities/home/ui/cards/HomeProductCards';
import type {ProductCardType} from '@/entities/home/model/types';
import type {TabStackParamList} from '@/navigations/tab/types';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import StackHeader from '@/features/mypage/ui/StackHeader';
import {useThemeSubscription} from '@/features/mypage/model/useThemeSubscription';

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
    isRefetching,
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

  return (
    <View className="flex-1 bg-white">
      {/*
        ★목록 화면도 "알림 묶음" 이라 같은 제목이면 목록/상세가 구분되지 않는다.
        묶음이 아직 안 왔을 때만 총칭으로 떨어진다.
      */}
      <StackHeader
        title={theme?.name ?? '알림 묶음'}
        onBack={navigation.goBack}
      />
      {isThemesError ? (
        <View className="pt-4">
          <SectionErrorRow label="알림 묶음" onRetry={refetchThemes} />
        </View>
      ) : isThemesPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#667085" />
        </View>
      ) : !theme ? (
        // web 은 `if (!theme) return null` 로 빈 화면을 내보낸다. 앱은 왜 비었는지
        // 알려준다 — 딥링크가 없어진 묶음 id 를 들고 올 수 있다.
        <View className="flex-1 items-center justify-center px-10">
          <Text className="text-center text-sm text-gray-500">
            없는 묶음이거나 지금은 볼 수 없어요.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={contentStyle}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetchAll} />
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
          <Pressable
            onPress={() => {
              if (isSubscribed) unsubscribe(themeId);
              else subscribe(themeId);
            }}
            disabled={isMutating}
            accessibilityRole="button"
            accessibilityLabel={isSubscribed ? '구독 해제' : '이 묶음 구독'}
            style={isMutating ? styles.dimmed : undefined}
            className={
              isSubscribed
                ? 'mt-4 items-center rounded-xl bg-gray-100 py-3.5'
                : 'bg-primary-500 mt-4 items-center rounded-xl py-3.5'
            }>
            <Text
              className={
                isSubscribed
                  ? 'text-base font-semibold text-gray-500'
                  : 'text-base font-semibold text-gray-900'
              }>
              {isSubscribed ? '구독 중 (해제)' : '이 묶음 구독'}
            </Text>
          </Pressable>

          {/* 포함 키워드 */}
          <View className="mt-6">
            <Text className="mb-2 text-sm font-medium text-gray-900">
              포함 키워드
            </Text>
            <View className="flex-row flex-wrap gap-1.5">
              {theme.representativeKeywords.map(keyword => (
                <Text
                  key={keyword}
                  className="rounded-md bg-gray-50 px-2.5 py-1 text-xs text-gray-600">
                  {keyword}
                </Text>
              ))}
            </View>
          </View>

          {/* 라이브 딜 */}
          <View className="mt-7">
            <Text className="mb-3 text-sm font-medium text-gray-900">
              {'🔥 지금 이 묶음에 뜬 딜 '}
              <Text className="text-primary-700">{deals?.length ?? 0}</Text>
            </Text>
            {isDealsError ? (
              <SectionErrorRow label="라이브 딜" onRetry={refetchDeals} />
            ) : isDealsPending ? (
              <View className="items-center py-8">
                <ActivityIndicator size="small" color="#667085" />
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

const styles = StyleSheet.create({
  content: {paddingHorizontal: 20, paddingTop: 24},
  grow: {flex: 1},
  dimmed: {opacity: 0.5},
});
