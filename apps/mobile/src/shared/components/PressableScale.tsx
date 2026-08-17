import React, {useCallback, useEffect, useRef} from 'react';
import {
  Animated,
  AppState,
  Pressable,
  View,
  type GestureResponderEvent,
  type PressableProps,
} from 'react-native';

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
  onPress,
  ...rest
}: PressableProps & {
  scaleTo?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = useCallback(
    (pressed: boolean) =>
      Animated.timing(scale, {
        toValue: pressed ? scaleTo : 1,
        duration: 100,
        useNativeDriver: true,
      }).start(),
    [scale, scaleTo],
  );

  /** 애니메이션 없이 즉시 원상복구. 화면 복귀처럼 "이미 지나간" 상황용. */
  const reset = useCallback(() => {
    scale.stopAnimation();
    scale.setValue(1);
  }, [scale]);

  /**
   * ★눌림 상태가 남는 걸 막는다.
   *
   * onPress 에서 상세로 push 하면 그 전환이 onPressOut 을 삼켜서 scale 이
   * 0.95 에 갇힌다 — 카드가 "좁아진 채 멈췄다가" 상세로 넘어가고, 뒤로 돌아오면
   * 여전히 좁아져 있다(사용자 지적). onPress 에서도 직접 되돌린다.
   */
  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      animate(false);
      onPress?.(e);
    },
    [animate, onPress],
  );

  /**
   * 안전망. 앱이 백그라운드에 갔다 오면 눌림이 남아 있을 수 있다.
   *
   * ★`useFocusEffect` 를 쓰지 않는다 — PressableScale 은 네비게이션 컨텍스트
   * 밖(테스트·독립 렌더)에서도 쓰이므로 그 훅을 넣으면 렌더가 통째로 터진다.
   * AppState 는 어디서든 안전하다.
   */
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') reset();
    });
    return () => sub.remove();
  }, [reset]);

  return (
    <Pressable
      onPressIn={() => animate(true)}
      onPressOut={() => animate(false)}
      onPress={handlePress}
      style={style}
      {...rest}>
      {/* ★scale 만. web 은 `whileTap={{scale:0.95}}` 뿐이고 opacity 를 건드리지
          않는다. 0.6 까지 흐려지면 카드가 순간 사라지는 것처럼 보여 과하다. */}
      <Animated.View style={{transform: [{scale}]}}>
        <View className={className}>{children}</View>
      </Animated.View>
    </Pressable>
  );
}
