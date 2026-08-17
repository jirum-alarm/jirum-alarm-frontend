import React, {useEffect, useRef} from 'react';
import {Animated, Dimensions, View} from 'react-native';

/**
 * 첫 화면 스켈레톤. 배너·랭킹이 준비될 때까지 자리를 잡아 둔다.
 *
 * ★크기를 실제 컴포넌트와 **정확히** 맞춘다. 어긋나면 데이터가 도착하는 순간
 * 레이아웃이 튀어서 스켈레톤을 쓴 의미가 없다(짤깁임을 없애려던 건데
 * 오히려 한 번 더 움직인다).
 *
 * web 은 SSR 로 실제 카드를 미리 그리지만(RankingSkeleton 의 RankingPreview)
 * RN 엔 그 데이터가 없어 형태만 같은 회색 판으로 둔다.
 */

/** 은은한 깜빡임. 정지된 회색 판은 "멈춘 화면"처럼 보인다. */
function useShimmer() {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return opacity;
}

/** HomeBannerCarousel 과 같은 크기(높이 92, 폭 화면-50). */
export function BannerSkeleton() {
  const opacity = useShimmer();
  const screenWidth = Dimensions.get('window').width;

  return (
    <View className="items-center">
      <Animated.View
        style={{
          width: screenWidth - 50,
          height: 92,
          opacity,
        }}
        className="rounded-lg bg-white/10"
      />
    </View>
  );
}

/** JirumRankingSlider 와 같은 크기(카드 240×352 + 도트 줄 20). */
export function RankingSkeleton() {
  const opacity = useShimmer();
  const screenWidth = Dimensions.get('window').width;
  const sidePadding = Math.max(0, (screenWidth - 240) / 2);

  return (
    <View>
      {/* 실제 리스트와 같은 상하 여백(paddingTop 6 / paddingBottom 20) */}
      <View
        className="flex-row"
        style={{paddingLeft: sidePadding, paddingTop: 6, paddingBottom: 20}}>
        {[0, 1].map(i => (
          <Animated.View
            key={i}
            style={{
              width: 240,
              height: 352,
              marginRight: 4,
              // 가운데 카드만 100%, 옆은 90% — 실제 슬라이더와 같은 비율
              transform: [{scale: i === 0 ? 1 : 0.9}],
              opacity,
            }}
            className="rounded-lg bg-gray-100"
          />
        ))}
      </View>
      {/* 도트 줄 자리 — 실제 슬라이더의 SliderDots(h-5)와 같은 높이 */}
      <View className="h-5" />
    </View>
  );
}
