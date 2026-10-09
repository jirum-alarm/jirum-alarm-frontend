import {keywordChip} from '@jirum/design-system/recipes';
import React from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

import XSmall from '@/shared/components/icons/XSmall';

import SectionHeader from '@/shared/components/ui/SectionHeader';
import {useColors} from '@/shared/theme/useColors';
import {cn} from '@/shared/lib/styling';

/** web Chip: 15자까지만 보여주고 넘치면 '...'. */
const MAX_CHIP_CHARS = 15;

/**
 * 최근 검색어. web: widgets/search/ui/RecentKeywords.tsx
 *
 * ★목록이 비면 섹션째 안 그린다(web 과 같다). web 안쪽의
 * "검색 내역이 없어요." 문구는 그 게이트 때문에 **도달 불가한 죽은 코드**라
 * 옮기지 않았다.
 *
 * ★web 은 `useDevice()` 로 모바일일 때만 한 줄 가로 스크롤(h-42)로 만든다.
 * 앱은 늘 모바일이라 분기 없이 가로 스크롤 하나다.
 */
export default function RecentKeywords({
  keywords,
  onSelect,
  onRemove,
  onClearAll,
}: {
  keywords: string[];
  onSelect: (keyword: string) => void;
  onRemove: (keyword: string) => void;
  /**
   * 전체 삭제. ⚠️web 엔 없는 버튼이다 — 앱의 최근 검색어는 AsyncStorage 라
   * 웹과 다른 저장소이고(웹 목록에 영향 없음), 칩을 하나씩 지우는 것 말곤
   * 비우는 방법이 없어 요청으로 추가했다.
   */
  onClearAll: () => void;
}) {
  const c = useColors();
  if (keywords.length === 0) return null;

  return (
    <View>
      <SectionHeader
        className="h-11"
        title="최근 검색어"
        right={
          <Pressable
            onPress={onClearAll}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="최근 검색어 전체 삭제"
            style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
            <Text className="text-sm text-gray-500">전체 삭제</Text>
          </Pressable>
        }
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // 높이를 안 주면 ScrollView 가 콘텐츠보다 큰 영역을 잡아 칩 위아래에
        // 빈 띠가 생긴다(CategoryTabBar 와 같은 처방).
        style={styles.strip}
        contentContainerStyle={styles.stripContent}>
        {keywords.map(keyword => (
          <Pressable
            key={keyword}
            onPress={() => onSelect(keyword)}
            accessibilityRole="button"
            accessibilityLabel={keyword}
            // ★높이는 className 으로 — 함수형 style 의 height 는 NativeWind 가 떨궈
            // 칩이 글자 높이(≈21pt)로 납작해졌다. h-9 = 바로 아래 추천 검색어 칩(py-2 + text-sm)과 같은 36pt.
            className={cn('flex-row items-center gap-x-1', keywordChip.box)}
            style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
            <Text className={keywordChip.text} numberOfLines={1}>
              {keyword.slice(0, MAX_CHIP_CHARS)}
              {keyword.length > MAX_CHIP_CHARS ? '...' : ''}
            </Text>
            {/*
              ★X 를 칩 안의 별도 Pressable 로 둔다 — 부모 onPress 가 먼저
              먹으면 지우려다 검색이 실행된다. RN 은 자식 터치가 부모로 안
              올라가므로 web 의 stopPropagation 이 필요 없다.
            */}
            <Pressable
              onPress={() => onRemove(keyword)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`${keyword} 삭제`}
              style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
              <XSmall width={16} height={16} color={c.gray[500]} />
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {flexGrow: 0, height: 42},
  stripContent: {paddingHorizontal: 20, alignItems: 'center', gap: 8},
});
