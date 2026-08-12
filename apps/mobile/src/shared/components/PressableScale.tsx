import React, {useRef} from 'react';
import {Animated, Pressable, View, type PressableProps} from 'react-native';

/**
 * 누르면 살짝 줄어드는 Pressable. web 의 motion whileTap={{scale:0.95}} 대응.
 *
 * ★ className 은 안쪽 View 가 받는다.
 * Pressable 에 두면 레이아웃(flex-row·padding·배경)이 바깥 껍데기에만 걸리고
 * children 은 스타일 없는 래퍼 안에 갇혀 세로로 쌓인다 — 카톡 배너와
 * 커뮤니티 링크가 줄바꿈됐던 원인이 이것이다.
 *
 * Animated.View 에 직접 className 을 주지 않는 이유: NativeWind 4 는 기본
 * 컴포넌트만 스타일을 처리해서 Animated.View 에 준 className 이 무시된다.
 * 그래서 transform 만 Animated.View 가 갖고, 스타일은 안쪽 View 가 받는다.
 */
export default function PressableScale({
  children,
  scaleTo = 0.95,
  style,
  className,
  ...rest
}: PressableProps & {
  scaleTo?: number;
  className?: string;
  children: React.ReactNode;
}) {
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
      <Animated.View style={{transform: [{scale}]}}>
        <View className={className}>{children}</View>
      </Animated.View>
    </Pressable>
  );
}
