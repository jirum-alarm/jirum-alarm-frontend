import {emptyText} from '@jirum/design-system/recipes';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';

import {ThemeQueries} from '@/entities/theme';
import type {TabStackParamList} from '@/navigations/tab/types';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import {usePullRefresh} from '@/shared/hooks/usePullRefresh';
import StackHeader from '@/features/mypage/ui/StackHeader';
import {ThemeCard} from '@/features/mypage/ui/ThemeCards';
import {useThemeSubscription} from '@/features/mypage/model/useThemeSubscription';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.THEMES
>;

/**
 * 알림 묶음 목록. web `/themes`(ThemeList).
 *
 * ★web 의 `isMobile` 분기(PC 2열 그리드 · `h1 sr-only`)는 옮기지 않는다 —
 * 앱은 항상 모바일이고, `sr-only` 는 스크린리더용 웹 개념이다.
 * ★`useRedirectIfNotLoggedIn`(비로그인 로그인 유도)도 옮기지 않는다:
 * `RootNavigator` 가 앱 전체를 로그인 뒤에 둬서 이 화면에 도달할 수 없다.
 */
export default function ThemesScreen({navigation}: Props) {
  const bottomClip = useHiddenTabBarClipPadding();
  const {
    data: themes,
    isPending,
    isError,
    refetch,
  } = useQuery(ThemeQueries.themes());
  // isRefetching 에 묶으면 앱 복귀 때의 조용한 갱신에도 위에서 스피너가 돈다 — 당길 때만.
  const {refreshing, onRefresh} = usePullRefresh(refetch);
  const {data: subscribedIds} = useQuery(ThemeQueries.mySubscribedIds());
  const {
    subscribe,
    unsubscribe,
    isPending: isMutating,
  } = useThemeSubscription();

  const subscribed = new Set(subscribedIds ?? []);
  const contentStyle = [styles.content, {paddingBottom: 24 + bottomClip}];

  return (
    <View className="flex-1 bg-white">
      <StackHeader title="관심사별 핫딜 알림" onBack={navigation.goBack} />
      {isError ? (
        <View className="pt-4">
          <SectionErrorRow label="관심사" onRetry={refetch} />
        </View>
      ) : isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" className="text-gray-500" />
        </View>
      ) : (
        <FlatList
          data={themes}
          keyExtractor={theme => theme.id}
          contentContainerStyle={contentStyle}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={ThemesListHeader}
          // 화면 안에서 `() => <View/>` 로 만들면 렌더마다 새 컴포넌트 타입이
          // 되어 목록이 통째로 다시 마운트된다 — 모듈 수준으로 뺀다.
          ItemSeparatorComponent={ThemeSeparator}
          ListEmptyComponent={ThemesEmpty}
          renderItem={({item}) => {
            const themeId = Number(item.id);
            const isSubscribed = subscribed.has(themeId);
            return (
              <ThemeCard
                theme={item}
                isSubscribed={isSubscribed}
                isPending={isMutating}
                onPress={() =>
                  navigation.push(tabStackNavigations.THEME_DETAIL, {
                    themeId: item.id,
                  })
                }
                onToggleSubscribe={() => {
                  if (isSubscribed) unsubscribe(themeId);
                  else subscribe(themeId);
                }}
              />
            );
          }}
        />
      )}
    </View>
  );
}

function ThemesListHeader() {
  return (
    <Text className="mb-5 text-sm text-gray-500">
      관심사를 고르면 키워드를 하나하나 등록하지 않아도, 반응 좋은 핫딜만 하루
      최대 3건 보내드려요.
    </Text>
  );
}

function ThemeSeparator() {
  return <View className="h-3" />;
}

function ThemesEmpty() {
  return (
    <View className="items-center py-10">
      <Text className={emptyText}>아직 관심사가 없어요.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {paddingHorizontal: 20, paddingTop: 24},
});
