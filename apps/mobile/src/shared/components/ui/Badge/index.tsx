import React from 'react';
import {View} from 'react-native';
import {badge} from '@jirum/design-system/recipes';
import {Text} from '@/shared/components/ui/Text/AppText';
import {cn} from '@/shared/lib/styling';

type Variants = typeof badge.variant;
type Recipe = {box: string; text: string};
/**
 * variant 마다 쓸 수 있는 tone 이 다르다(solid 는 gray·secondary·error, outline 은 gray 만).
 * ★mapped type(`[V in keyof …]`)으로 쓰지 말 것 — 앱 eslint 의 no-unused-vars 가 그 문법에서 죽는다.
 */
type BadgeColor =
  | {variant: 'soft'; tone: keyof Variants['soft']}
  | {variant: 'solid'; tone: keyof Variants['solid']}
  | {variant: 'outline'; tone: keyof Variants['outline']};

export type BadgeProps = Partial<BadgeColor> & {
  size?: keyof typeof badge.size;
  /** 판정 배지(역대 최저·평소보다 비싸요)는 알약 모양. */
  pill?: boolean;
  /** 겉(View)에 — 위치(absolute)·정렬(self-start) 같은 배치만. 색·크기는 variant·tone·size 로. */
  className?: string;
  children: React.ReactNode;
};

/**
 * 작은 라벨(상태·판정·정보). 누를 수 없다 — 누르는 건 Chip.
 * 모양은 @jirum/design-system recipes 의 badge — web Badge 와 같은 클래스(겉=View, 글자=Text).
 */
export default function Badge({
  variant = 'soft',
  tone = 'gray',
  size = 'sm',
  pill = false,
  className,
  children,
}: BadgeProps) {
  const color = (badge.variant[variant] as Record<string, Recipe>)[tone];
  return (
    <View
      className={cn(
        size === 'tag' && 'justify-center',
        badge.size[size].box,
        pill && badge.pill.box,
        color.box,
        className,
      )}>
      {/* web whitespace-nowrap — 좁은 카드에서 "최저가 보상"이 두 줄로 쪼개지지 않게. */}
      <Text className={cn(badge.size[size].text, color.text)} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}
