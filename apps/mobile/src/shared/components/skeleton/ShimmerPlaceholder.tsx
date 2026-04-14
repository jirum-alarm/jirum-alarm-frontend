import React, {useEffect} from 'react';
import {StyleSheet, View, type ViewStyle} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ShimmerProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Shimmer({
  width,
  height,
  borderRadius = 8,
  style,
}: ShimmerProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {duration: 800, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: '#E4E7EC',
        },
        style,
        animatedStyle,
      ]}
    />
  );
}

/** 공통 스켈레톤 레이아웃: 상품 카드 2열 그리드 */
export function ProductGridSkeleton() {
  return (
    <View style={skeletonStyles.grid}>
      {Array.from({length: 6}).map((_, i) => (
        <View key={i} style={skeletonStyles.card}>
          <Shimmer width="100%" height={120} borderRadius={12} />
          <View style={skeletonStyles.cardText}>
            <Shimmer width="80%" height={14} borderRadius={4} />
            <Shimmer width="50%" height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** 공통 스켈레톤 레이아웃: 리스트 아이템 */
export function ListItemSkeleton({count = 5}: {count?: number}) {
  return (
    <View style={skeletonStyles.list}>
      {Array.from({length: count}).map((_, i) => (
        <View key={i} style={skeletonStyles.listItem}>
          <Shimmer width={48} height={48} borderRadius={8} />
          <View style={skeletonStyles.listItemText}>
            <Shimmer width="70%" height={14} borderRadius={4} />
            <Shimmer width="40%" height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: '47%',
    marginBottom: 8,
  },
  cardText: {
    marginTop: 8,
    gap: 6,
  },
  list: {
    paddingHorizontal: 16,
    gap: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listItemText: {
    flex: 1,
    gap: 6,
  },
});
