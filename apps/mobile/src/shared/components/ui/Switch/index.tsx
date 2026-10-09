import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import {toggle} from '@jirum/design-system/recipes';
import {tick} from '@/shared/lib/feedback/haptic';
import {cn} from '@/shared/lib/styling';

/** 노브 이동 거리 — 레시피 track w-11(44) − knob w-5(20) − 양쪽 여백 2·2. web 의 translate-x-5 와 같다. */
const KNOB_TRAVEL = 20;

/**
 * 켜고 끄는 스위치. 모양은 @jirum/design-system recipes 의 toggle — web Switch 와 같은 44x24.
 * RN 내장 Switch 는 플랫폼마다 크기·색이 달라 web 과 눈에 보이게 어긋나서 직접 그린다.
 * 켜진 색은 꺼진 트랙 위에 겹친 면의 투명도로 번진다 — 색은 레시피 클래스에서 받고(다크 포함),
 * 애니메이션은 투명도·이동뿐이라 네이티브 드라이버로 돈다.
 */
export default function Switch({
  value,
  disabled,
  onChange,
  accessibilityLabel,
}: {
  value: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  accessibilityLabel: string;
}) {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [value, progress]);

  return (
    <Pressable
      onPress={() => {
        tick();
        onChange(!value);
      }}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{checked: value, disabled: !!disabled}}
      accessibilityLabel={accessibilityLabel}
      style={disabled ? styles.dimmed : undefined}
      className="shrink-0">
      <View className={cn('justify-center', toggle.track, toggle.off)}>
        {/* ★Animated.View 엔 className 을 주지 않는다(NativeWind 가 무시) — 색은 안쪽 View 가 받는다. */}
        <Animated.View style={[StyleSheet.absoluteFill, {opacity: progress}]}>
          <View className={cn('flex-1', toggle.track, toggle.on)} />
        </Animated.View>
        <Animated.View
          style={[
            styles.knob,
            {
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, KNOB_TRAVEL],
                  }),
                },
              ],
            },
          ]}>
          <View className={toggle.knob} />
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dimmed: {opacity: 0.5},
  knob: {marginLeft: 2},
});
