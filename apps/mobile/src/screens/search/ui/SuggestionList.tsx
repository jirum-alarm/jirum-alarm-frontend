import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text} from 'react-native';

import SearchIcon from '@/shared/components/icons/search';

import {splitByPrefix} from '../lib/highlight';

/**
 * 자동완성 목록. web: widgets/search/ui/SearchAutocompleteDropdown.tsx
 *
 * ★web 의 키보드 탐색(ArrowUp/Down·Escape·activeIndex)은 옮기지 않았다 —
 * 모바일 키보드엔 방향키가 없고 앱은 항목을 눌러서 고른다. 그래서
 * `aria-activedescendant` 류의 상태가 전부 필요 없어진다.
 *
 * ★`keyboardShouldPersistTaps='handled'` 가 필수다. 없으면 첫 탭이 키보드를
 * 내리는 데만 쓰이고 항목 선택이 씹힌다.
 *
 * ponytail: 최대 10개짜리 목록에 FlatList 를 쓰지 않는다. 가상화가 필요 없고,
 * 높이가 콘텐츠에 따라 정해지는 absolute 컨테이너 안에서 FlatList 는 높이가
 * 0 으로 접힐 수 있다(ScrollView 는 maxHeight 로 스스로 경계를 만든다).
 */
export default function SuggestionList({
  suggestions,
  highlight,
  onSelect,
}: {
  suggestions: string[];
  /** 굵게 표시할 입력 prefix. */
  highlight: string;
  onSelect: (suggestion: string) => void;
}) {
  return (
    <ScrollView
      className="border-b border-gray-200 bg-white"
      style={styles.wrap}
      keyboardShouldPersistTaps="handled">
      {suggestions.map((suggestion, index) => (
        <Pressable
          key={`${suggestion}-${index}`}
          onPress={() => onSelect(suggestion)}
          accessibilityRole="button"
          accessibilityLabel={suggestion}
          className="flex-row items-center gap-2 px-5 py-3"
          style={({pressed}) => ({
            backgroundColor: pressed ? '#F9FAFB' : '#FFFFFF',
          })}>
          <SearchIcon width={18} height={18} color="#98A2B3" />
          <Text className="text-sm text-gray-700" numberOfLines={1}>
            {splitByPrefix(suggestion, highlight).map((part, i) => (
              <Text
                key={i}
                className={
                  part.match ? 'font-semibold text-gray-900' : undefined
                }>
                {part.text}
              </Text>
            ))}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /**
   * 제안어가 많아도 화면을 다 덮지 않게 자른다(web max-h-80 = 320px).
   * 높이는 style 로 — NativeWind 크기 클래스는 여기서 주지 않는다.
   */
  wrap: {maxHeight: 320},
});
