import React from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {tab} from '@jirum/design-system/recipes';
import PressableScale from '@/shared/components/PressableScale';
import {Text} from '@/shared/components/ui/Text/AppText';
import {tick} from '@/shared/lib/feedback/haptic';
import {cn} from '@/shared/lib/styling';

/**
 * 면을 채우는 탭(목록 전환). 모양은 @jirum/design-system recipes 의 tab — web 은 각 자리의
 * `<button>` 이 같은 레시피를 읽는다(community TabBar·TossCategoryTabs·CurationContainer·TabbarV2).
 * neutral = 커뮤니티·토스 하위 카테고리·큐레이션, brand = 랭킹 카테고리(라임).
 * 테두리만 있는 Chip(필터·섹션 탭)과는 다른 물건이다.
 */
export default function TabPill({
  label,
  selected = false,
  variant = 'neutral',
  size = 'sm',
  onPress,
  onLayout,
}: {
  label: string;
  selected?: boolean;
  variant?: 'neutral' | 'brand';
  /** sm = 32px(커뮤니티·토스 하위), md = 36px(랭킹·큐레이션) */
  size?: 'sm' | 'md';
  onPress: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
}) {
  const state = selected ? tab[variant].selected : tab[variant].idle;
  return (
    <PressableScale
      onPress={() => {
        tick();
        onPress();
      }}
      onLayout={onLayout}
      accessibilityRole="tab"
      accessibilityState={{selected}}
      accessibilityLabel={label}
      className={cn('justify-center', tab.size[size], state.box)}>
      <Text className={state.text}>{label}</Text>
    </PressableScale>
  );
}
