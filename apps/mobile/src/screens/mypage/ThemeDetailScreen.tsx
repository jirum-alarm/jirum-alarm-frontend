import React, {useCallback} from 'react';
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
          <ActivityIndicator size="small" color="#667085" />
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

          {/* 포함 키워드 */}
          <View className="mt-6">
            <Text className="mb-0.5 text-sm font-medium text-gray-900">
              이런 키워드가 들어간 딜을 골라요
            </Text>
            <Text className="mb-2 text-xs text-gray-500">
              딜이 뜰 때마다가 아니라, 그중 반응이 좋은 것만 보내드려요.
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
              {'🔥 지금 이 관심사에 뜬 딜 '}
              <Text className="text-primary-800">{deals?.length ?? 0}</Text>
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

const styles = StyleSheet.create({
  content: {paddingHorizontal: 20, paddingTop: 24},
  grow: {flex: 1},
});
