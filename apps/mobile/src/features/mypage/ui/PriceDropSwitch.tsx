import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {tick} from '@/shared/lib/feedback';

/**
 * 키워드 한 줄의 "가격 하락 알림" 스위치. web `PriceDropOnlyToggle`.
 *
 * ★유저 전역이 아니라 **키워드별** 설정이다("삼다수는 싸질 때만, 노트북은 전부").
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
  showLabel = true,
}: {
  value: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  /**
   * 행마다 "가격 하락 알림" 을 붙일지. **목록에서는 끈다** — 키워드가 20개면
   * 같은 문구가 20번 반복돼 정작 키워드가 안 읽힌다. 목록은 열 제목을 한 번만
   * 두고, 스크린리더용 라벨은 `accessibilityLabel` 에 그대로 남는다.
   */
  showLabel?: boolean;
}) {
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
      accessibilityLabel="가격 내려갔을 때만 알림 받기"
      // ★flex·크기는 style, 색·정렬은 className (NativeWind 규칙).
      style={disabled ? styles.dimmed : undefined}
      className="shrink-0 flex-row items-center gap-1.5">
      {showLabel ? (
        <Text className="text-xs text-gray-500">가격 하락 알림</Text>
      ) : null}
      {/* 트랙 — web h-5 w-9 (20x36) */}
      {/* ★Animated.View 엔 className 을 주지 않는다(NativeWind 가 무시) — 색은 style 로. */}
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['#D0D5DD', '#9EF22E'], // gray-300 → primary-500
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
