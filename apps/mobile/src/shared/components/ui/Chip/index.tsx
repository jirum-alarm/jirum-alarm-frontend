import React from 'react';
import {
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {chip} from '@jirum/design-system/recipes';
import PressableScale from '@/shared/components/PressableScale';
import {Text} from '@/shared/components/ui/Text/AppText';
import {tick} from '@/shared/lib/feedback/haptic';
import {cn} from '@/shared/lib/styling';

/**
 * 고르는 칩(필터·탭). 모양은 @jirum/design-system recipes 의 chip — web Chip 과 같은 클래스.
 * ★고르면 글자가 굵어져도 칩 너비는 그대로다: 굵은 글자를 안 보이게 한 번 더 깔아 너비를 미리 잡는다
 * (예전엔 고를 때마다 칩이 넓어져 옆 칩이 밀렸다 — 키워드 칩 "크기가 변해" 지적과 같은 문제).
 * 누르면 가벼운 햅틱(검색 필터 칩과 같게).
 */
export default function Chip({
  label,
  selected = false,
  size = 'md',
  onPress,
  onLayout,
  style,
}: {
  label: string;
  selected?: boolean;
  /** md = 탭(홈·추천), sm = 필터(검색), xs = 하위 탭 */
  size?: keyof typeof chip.size;
  onPress: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
  /** 바깥 크기·배치(flex 등)는 style 로 — PressableScale 은 className 을 안쪽 View 에 준다. */
  style?: StyleProp<ViewStyle>;
}) {
  const state = selected ? chip.selected : chip.idle;
  return (
    <PressableScale
      onPress={() => {
        tick();
        onPress();
      }}
      onLayout={onLayout}
      accessibilityRole="button"
      accessibilityState={{selected}}
      accessibilityLabel={label}
      style={style}
      className={cn(chip.size[size].box, state.box)}>
      <View>
        <Text
          className={cn(chip.size[size].text, 'font-semibold opacity-0')}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants">
          {label}
        </Text>
        <Text
          className={cn(
            'absolute inset-0 text-center',
            chip.size[size].text,
            state.text,
          )}>
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}
