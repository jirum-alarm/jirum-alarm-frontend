import React, {useMemo} from 'react';
import {Pressable, View, type PressableProps} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/**
 * 누르면 살짝 줄어드는 Pressable. web 의 motion whileTap={{scale:0.95}} 대응.
 *
 * ★눌림 애니메이션은 **UI 스레드**에서 돈다(2026-10-01). 예전엔 onPressIn(JS) 에서
 * Animated.timing 을 시작해, JS 가 전환·스크롤로 밀려 있으면 줄어드는 게 한 박자 늦었다
 * (사용자 지적 "터치 반응이 한 박자 늦다").
 * 지금은 RNGH `Gesture.Manual()` 이 손가락이 닿는/떨어지는 순간을 네이티브에서 받아
 * Reanimated 공유값으로 바로 줄인다. Manual 은 **끝까지 활성화하지 않으므로** Pressable 의
 * 터치를 뺏지 않는다 — onPress·접근성(VoiceOver)·길게 누르기·disabled 는 그대로 Pressable 몫.
 * 스크롤이 시작되면 네이티브가 터치를 취소해(onTouchesCancelled) 원래 크기로 돌아온다.
 *
 * 예전 구현의 두 안전장치(onPress 에서 되돌리기·AppState 복귀 시 리셋)는 필요 없어졌다 —
 * 상세 push 가 JS 의 onPressOut 을 삼켜 0.95 에 갇히던 문제는, 이제 손을 떼는 순간을
 * 네이티브가 직접 받으므로 생기지 않는다.
 *
 * ★ className 은 안쪽 View 가 받는다. Pressable 에 두면 레이아웃(flex-row·padding·배경)이
 * 바깥 껍데기에만 걸리고 children 은 스타일 없는 래퍼 안에 갇혀 세로로 쌓인다.
 * Animated.View 에 직접 className 을 주지 않는다 — transform 만 Animated.View 가 갖는다.
 * ★scale 만. web 은 `whileTap={{scale:0.95}}` 뿐이고 opacity 를 건드리지 않는다.
 */
const DURATION = 100;

export default function PressableScale({
  children,
  scaleTo = 0.95,
  style,
  className,
  disabled,
  hitSlop,
  ...rest
}: PressableProps & {
  scaleTo?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(1);

  const feedback = useMemo(
    () =>
      Gesture.Manual()
        .enabled(!disabled)
        // Pressable 과 같은 범위에서 줄어들게(hitSlop 영역을 눌러도 반응).
        .hitSlop(hitSlop ?? undefined)
        .onTouchesDown(() => {
          'worklet';
          scale.value = withTiming(scaleTo, {duration: DURATION});
        })
        .onTouchesUp(() => {
          'worklet';
          scale.value = withTiming(1, {duration: DURATION});
        })
        .onTouchesCancelled(() => {
          'worklet';
          scale.value = withTiming(1, {duration: DURATION});
        })
        .onFinalize(() => {
          'worklet';
          scale.value = withTiming(1, {duration: DURATION});
        }),
    [disabled, hitSlop, scale, scaleTo],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <GestureDetector gesture={feedback}>
      <Pressable {...rest} disabled={disabled} hitSlop={hitSlop} style={style}>
        <Animated.View style={animatedStyle}>
          <View className={className}>{children}</View>
        </Animated.View>
      </Pressable>
    </GestureDetector>
  );
}
