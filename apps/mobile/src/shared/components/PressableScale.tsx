import React, {useRef} from 'react';
import {Animated, Pressable, type PressableProps} from 'react-native';

/**
 * 누르면 살짝 줄어드는 Pressable.
 *
 * web 은 카드·버튼·링크에 motion 의 whileTap={{scale:0.95}} 를 쓴다. 옮길 때
 * 그냥 Pressable 로 바꿔서 눌러도 아무 반응이 없었다 — 터치 기기에서는 hover 가
 * 없어 "눌렸다"는 신호가 이것뿐이라 없으면 먹통처럼 느껴진다.
 *
 * ponytail: Animated 로 충분. reanimated 를 끌어올 이유가 없다(값 하나짜리 트윈).
 */
export default function PressableScale({
  children,
  scaleTo = 0.95,
  style,
  ...rest
}: PressableProps & {scaleTo?: number; children: React.ReactNode}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (to: number) =>
    Animated.timing(scale, {
      toValue: to,
      duration: 100,
      useNativeDriver: true,
    }).start();

  return (
    <Pressable
      onPressIn={() => animate(scaleTo)}
      onPressOut={() => animate(1)}
      style={style}
      {...rest}>
      <Animated.View style={{transform: [{scale}]}}>{children}</Animated.View>
    </Pressable>
  );
}
