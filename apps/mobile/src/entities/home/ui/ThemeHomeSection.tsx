import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';

import {ThemeQueries} from '@/entities/theme';
import type {ThemeWithKeywords} from '@/shared/api/theme/theme.service';
import PressableScale from '@/shared/components/PressableScale';
import SectionHeader from '@/shared/components/ui/SectionHeader';
import {Text} from '@/shared/components/ui/Text/AppText';

/**
 * 홈 알림 묶음(관심사) 캐러셀. web: widgets/home/ui/ThemeSection.tsx
 * `under-10000`(만원이하템) 뒤, 인기 키워드 칩 아래에 들어간다.
 *
 * 최근 7일 알림 0건인 묶음은 구독해도 아무것도 안 온다 → 홈에서만 숨긴다(목록·상세는 유지).
 * 실패·빈 목록이면 섹션째 숨긴다(RecommendedKeywordSection 과 같은 판단).
 */
export default function ThemeHomeSection({
  onPressTheme,
  onPressMore,
}: {
  onPressTheme: (theme: ThemeWithKeywords) => void;
  onPressMore: () => void;
}) {
  const {data: allThemes = []} = useQuery(ThemeQueries.themes());
  const themes = allThemes.filter(theme => theme.weeklyAlertCount > 0);

  if (!themes.length) return null;

  return (
    <View className="gap-y-2">
      <SectionHeader title="관심사별 핫딜 알림" onPressMore={onPressMore} />
      <FlatList
        horizontal
        data={themes}
        keyExtractor={theme => theme.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <ThemeHomeCard theme={item} onPress={() => onPressTheme(item)} />
        )}
      />
    </View>
  );
}

function ThemeHomeCard({
  theme,
  onPress,
}: {
  theme: ThemeWithKeywords;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${theme.name} 관심사 알림`}
      style={styles.card}
      className="gap-y-1.5 rounded-xl bg-gray-50 p-4">
      <Text className="text-2xl" accessibilityElementsHidden>
        {theme.emoji || '🔔'}
      </Text>
      <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
        {theme.name}
      </Text>
      <Text className="text-xs text-gray-500" numberOfLines={1}>
        {theme.representativeKeywords.slice(0, 3).join('·')}
      </Text>
      <Text className="text-xs text-gray-500">
        최근 7일 알림{' '}
        <Text className="text-xs font-semibold text-gray-900">
          {theme.weeklyAlertCount}건
        </Text>
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  list: {paddingHorizontal: 20, gap: 10},
  // web 모바일 카드 폭(!w-[180px]).
  card: {width: 180},
});
