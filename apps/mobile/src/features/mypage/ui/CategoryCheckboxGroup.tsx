import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {CATEGORIES} from '../lib/categories';

/**
 * 관심 카테고리 3열 체크박스. web `entities/category/ui/CategoriesCheckboxGroup`.
 * 선택 상태는 테두리·배경으로만 가른다(web peer-checked 와 같은 색).
 */
export default function CategoryCheckboxGroup({
  selected,
  onToggle,
}: {
  selected: ReadonlySet<number>;
  onToggle: (value: number, next: boolean) => void;
}) {
  return (
    <View className="flex-row flex-wrap" style={styles.grid}>
      {CATEGORIES.map(category => {
        const checked = selected.has(category.value);
        return (
          <Pressable
            key={category.value}
            onPress={() => onToggle(category.value, !checked)}
            accessibilityRole="checkbox"
            accessibilityState={{checked}}
            accessibilityLabel={category.text}
            // ★폭은 style 로 준다 — 3열이므로 (100% - gap 2칸) / 3.
            // className 으로 주면 NativeWind 가 계산식을 못 만든다.
            style={styles.cell}
            className={
              checked
                ? 'border-primary-500 bg-primary-50 h-[88px] items-center justify-center rounded-lg border'
                : 'h-[88px] items-center justify-center rounded-lg border border-gray-300'
            }>
            <View className="items-center gap-2">
              <Text className="text-2xl">{category.icon}</Text>
              <Text className="text-sm text-gray-700">{category.text}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {gap: 10},
  cell: {width: '31%'},
});
