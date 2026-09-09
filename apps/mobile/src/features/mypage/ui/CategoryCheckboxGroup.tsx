import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {CATEGORY_ICON} from '@/shared/components/product/NoImage';
import EtcOnIcon from '@/shared/components/icons/categories/EtcOnIcon';

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
              {/*
                ★이모지 대신 앱이 이미 갖고 있는 카테고리 라인 아이콘을 쓴다.
                이모지는 OS·폰트마다 모양이 달라지고 나머지 라인 아이콘 체계와
                섞여 보였다. 특히 `상품권=💵`·`기타=🔍`(검색 아이콘과 혼동)가
                뜻을 잘못 전했다. 표는 `NoImage` 것을 그대로 쓴다 — 새로 만들면
                번호가 어긋날 수 있다.
              */}
              <CategoryIcon value={category.value} />
              <Text className="text-sm text-gray-700">{category.text}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function CategoryIcon({value}: {value: number}) {
  const Icon = CATEGORY_ICON[value] ?? EtcOnIcon;
  return <Icon width={32} height={32} />;
}

const styles = StyleSheet.create({
  grid: {gap: 10},
  cell: {width: '31%'},
});
