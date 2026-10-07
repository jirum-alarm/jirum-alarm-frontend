import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet} from 'react-native';
import {tick} from '@/shared/lib/feedback';
import {useColors} from '@/shared/theme/useColors';

/**
 * 켜고 끄는 스위치(알림 설정 화면). 이름은 키워드 화면의 "가격 하락 알림" 스위치로
 * 처음 만들어서 남은 것 — 그 스위치는 2026-10-07 키워드 카드의 2지선다로 바뀌었다.
 *
 * ponytail: 레포에 Switch primitive 가 없다(web 도 hidden checkbox +
 * peer-checked 로 모양만 냈다). RN 엔 peer 가 없으니 `Pressable` 두 겹으로
 * 같은 20x36 트랙 + 16px 노브를 직접 그린다. `Switch`(RN 내장)는 플랫폼마다
 * 크기·색이 달라 web 과 눈에 보이게 어긋난다.
 */
export default function PriceDropSwitch({
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
  const c = useColors();
  // 노브는 미끄러지고 트랙 색은 번진다 — 예전엔 marginLeft 를 2 → 18 로 바꿔 순간이동했다.
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: 160,
      useNativeDriver: false, // 트랙 배경색 보간 — 색은 네이티브 드라이버가 못 한다(36px 한 칸이라 비용 없음).
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
      // ★flex·크기는 style, 색·정렬은 className (NativeWind 규칙).
      style={disabled ? styles.dimmed : undefined}
      className="shrink-0 flex-row items-center">
      {/* 트랙 — web h-5 w-9 (20x36) */}
      {/* ★Animated.View 엔 className 을 주지 않는다(NativeWind 가 무시) — 색은 style 로. */}
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [c.gray[300], c.primary[500]], // gray-300 → primary-500
            }),
          },
        ]}>
        {/* 노브 — web h-4 w-4 (16px), 켜지면 오른쪽으로 16px */}
        <Animated.View
          style={[
            styles.knob,
            {
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 16],
                  }),
                },
              ],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dimmed: {opacity: 0.5},
  /** web h-5 w-9 (20x36) */
  track: {width: 36, height: 20, borderRadius: 999, justifyContent: 'center'},
  /** web h-4 w-4 (16px). 켜지면 오른쪽으로 16px(translate-x-4 대응). */
  knob: {
    width: 16,
    height: 16,
    marginLeft: 2,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
});
