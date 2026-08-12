import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';

import {HotDealType} from '@/shared/api/gql/graphql';

export const hotdealTextMap: Record<HotDealType, string> = {
  [HotDealType.HotDeal]: '핫딜',
  [HotDealType.SuperDeal]: '대박딜',
  [HotDealType.UltraDeal]: '초대박딜',
};

/** web HotdealBadge 와 같은 3색 그라디언트. stop 위치까지 맞춰야 색이 안 튄다. */
const GRADIENTS: Record<HotDealType, Array<[string, string]>> = {
  [HotDealType.HotDeal]: [
    ['0', '#F19824'],
    ['0.51', '#E15A00'],
    ['1', '#E68B13'],
  ],
  [HotDealType.SuperDeal]: [
    ['0', '#F76C7C'],
    ['0.56', '#EB001C'],
    ['1', '#F76C7C'],
  ],
  [HotDealType.UltraDeal]: [
    ['0', '#EB001C'],
    ['0.48', '#BB0016'],
    ['1', '#EB001C'],
  ],
};

type Props = {
  hotdealType: HotDealType;
  /** page = 4면 둥근 모서리 / card = 우상단·좌하단만 (web 과 동일) */
  badgeVariant: 'page' | 'card';
};

export default function HotdealBadge({hotdealType, badgeVariant}: Props) {
  // 초대박딜만 글자가 4자라 web 도 폭을 넓힌다.
  const width = hotdealType === HotDealType.UltraDeal ? 62 : 57;
  const height = 24;
  const radius =
    badgeVariant === 'page'
      ? {borderRadius: 8}
      : {borderTopRightRadius: 8, borderBottomLeftRadius: 8};

  return (
    <View style={[{width, height}, radius, styles.container]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="g" x1="0" y1="0" x2="1" y2="0">
            {GRADIENTS[hotdealType].map(([offset, color]) => (
              <Stop key={offset} offset={offset} stopColor={color} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#g)" />
      </Svg>
      <Text style={styles.label}>{hotdealTextMap[hotdealType]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
