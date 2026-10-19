import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {press} from '@jirum/design-system/recipes';

/**
 * 누르는 동안 흐려지는 Pressable — 면이 없는 아이콘 버튼·글자 링크용(면이 있으면 PressableScale).
 * 디자인 시스템 `press.dim`. 맨 Pressable 은 눌러도 티가 안 나 «씹혔나?» 하고 다시 누르게 된다.
 *
 * ★함수형 style 을 쓰지 않는다 — className 이 붙은 Pressable 에 함수형 style 을 주면 NativeWind 가
 * 그 함수를 실행하지 않고 버린다(react-native-css-interop `collectInlineRules`). 호출부가 준 레이아웃
 * (관심 카테고리 칸 너비 31%·성별 반칸)까지 같이 사라져 3열 격자가 무너졌다(2026-10-20).
 * 눌림은 onPressIn/Out 상태로 들고 style 은 정적 배열로 넘긴다.
 */
export default function PressableOpacity({
  style,
  onPressIn,
  onPressOut,
  ...rest
}: Omit<PressableProps, 'style'> & {style?: StyleProp<ViewStyle>}) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      {...rest}
      onPressIn={e => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={e => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={[style, pressed ? styles.pressed : styles.idle]}
    />
  );
}

const styles = StyleSheet.create({
  idle: {opacity: 1},
  pressed: {opacity: press.dim},
});
