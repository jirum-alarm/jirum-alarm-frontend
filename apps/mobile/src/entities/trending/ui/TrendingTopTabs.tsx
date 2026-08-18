import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';

import PressableScale from '@/shared/components/PressableScale';

/**
 * 발견 탭 상단 2분할(실시간 · 랭킹).
 * web: widgets/trending/ui/PageTabNavigation.tsx — 하단 밑줄로 활성 표시.
 *
 * ★ web 은 Link 두 개(라우트가 갈린다)지만 앱은 한 화면 안 상태 전환이다.
 * 라우트를 나누면 탭 스택에 두 화면이 쌓여 뒤로가기가 실시간↔랭킹을 왕복한다.
 *
 * ★ 밑줄은 web 처럼 활성 탭에만 그리는 게 아니라 **하나를 좌우로 움직인다**.
 * 탭이 정확히 2개이고 폭이 같아서 onLayout 측정 없이 0↔1 보간으로 끝난다
 * (web 은 `transition-colors` 로 글자색만 바꾸고 밑줄은 순간이동한다 —
 * 네이티브에선 그게 뚝 끊겨 보여서 밑줄을 잇는다).
 */
export type TrendingView = 'live' | 'ranking';

const TABS: {id: TrendingView; label: string}[] = [
  {id: 'live', label: '실시간'},
  {id: 'ranking', label: '랭킹'},
];

/** web `transition-colors` 기본값(150ms)보다 살짝 길게 — 이동 거리가 있어서. */
const DURATION_MS = 220;

const COLOR_ACTIVE = '#101828'; // gray-900
const COLOR_INACTIVE = '#667085'; // gray-500

export default function TrendingTopTabs({
  active,
  onSelect,
}: {
  active: TrendingView;
  onSelect: (view: TrendingView) => void;
}) {
  const activeIndex = TABS.findIndex(t => t.id === active);
  // 0 = 실시간, 1 = 랭킹. 밑줄 위치와 글자색을 같은 값으로 움직인다.
  const progress = useSharedValue(activeIndex);

  useEffect(() => {
    progress.value = withTiming(activeIndex, {
      duration: DURATION_MS,
      // web transition 의 기본 ease 와 같은 곡선.
      easing: Easing.out(Easing.cubic),
    });
  }, [activeIndex, progress]);

  const underlineStyle = useAnimatedStyle(() => ({
    // 탭 폭이 50% 라 left 를 0%↔50% 로 움직인다(측정 불필요).
    left: `${progress.value * 50}%`,
  }));

  return (
    // web 은 이 탭 줄이 PageHeader(h-14 = 56px) 의 유일한 children 이라
    // 실제 높이가 56px 이다(자체 py-3 는 그 안에서 남는다). 같은 높이로 맞춘다.
    // 경계선은 web PageTabNavigation 자신의 값(border-gray-200)을 쓴다 —
    // PageHeader 의 gray-100 이 아니다(탭 줄이 헤더 하단을 덮는다).
    <View className="h-14 w-full border-b border-gray-200 bg-white">
      <View className="h-full w-full flex-row">
        {TABS.map((tab, index) => (
          <TabLabel
            key={tab.id}
            label={tab.label}
            index={index}
            progress={progress}
            isActive={tab.id === active}
            onPress={() => onSelect(tab.id)}
          />
        ))}
      </View>

      {/*
        움직이는 밑줄 하나. 탭마다 그리면 전환이 순간이동이 된다.
        ★부모가 아니라 이 줄 컨테이너 기준 absolute 라 w-1/2 가 탭 폭과 같다.
      */}
      <Animated.View
        // ★className 을 쓰지 않는다 — NativeWind 4 는 기본 컴포넌트만 처리해서
        // Animated.View 에 준 className 이 **조용히 무시된다**
        // (PressableScale 주석과 같은 이유). 그래서 전부 style 로 쓴다.
        style={[
          {
            position: 'absolute',
            bottom: 0,
            height: 2, // h-0.5
            width: '50%',
            backgroundColor: COLOR_ACTIVE, // bg-gray-900
          },
          underlineStyle,
        ]}
      />
    </View>
  );
}

/**
 * 탭 하나. 글자색도 밑줄과 같은 progress 로 보간해 둘이 함께 움직인다
 * (색만 즉시 바뀌면 밑줄은 미끄러지는데 글자는 튀어 어긋나 보인다).
 */
function TabLabel({
  label,
  index,
  progress,
  isActive,
  onPress,
}: {
  label: string;
  index: number;
  progress: {value: number};
  isActive: boolean;
  onPress: () => void;
}) {
  const textStyle = useAnimatedStyle(() => {
    // 이 탭에 가까울수록(거리 0) 진해진다.
    const distance = Math.abs(progress.value - index);
    return {
      color: interpolateColor(
        Math.min(1, distance),
        [0, 1],
        [COLOR_ACTIVE, COLOR_INACTIVE],
      ),
    };
  });

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{selected: isActive}}
      accessibilityLabel={label}
      // ★flex 는 style 로 준다. className 은 PressableScale **안쪽** View 가
      // 받으므로 바깥 Pressable 폭이 0 이 되어 탭이 통째로 안 보였다.
      style={{flex: 1}}
      className="h-full w-full items-center justify-center">
      {/* className 대신 style — 위 밑줄과 같은 이유(NativeWind + Animated). */}
      <Animated.Text
        style={[{fontSize: 16, lineHeight: 24, fontWeight: '500'}, textStyle]}>
        {label}
      </Animated.Text>
    </PressableScale>
  );
}
