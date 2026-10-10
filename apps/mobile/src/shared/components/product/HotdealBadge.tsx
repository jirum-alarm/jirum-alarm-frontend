import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
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
  // 초대박딜만 글자가 4자라 web 도 폭을 넓힌다. 고정 폭이면 글자 확대(최대 1.3배)에서
  // "초대박딜"이 잘려 minWidth 로 두고 그라디언트는 100% 로 따라 늘린다.
  const minWidth = hotdealType === HotDealType.UltraDeal ? 62 : 57;
  const minHeight = 24;
  const radius =
    badgeVariant === 'page'
      ? {borderRadius: 8}
      : {borderTopRightRadius: 8, borderBottomLeftRadius: 8};

  return (
    <View style={[{minWidth, minHeight}, radius, styles.container]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="g" x1="0" y1="0" x2="1" y2="0">
            {GRADIENTS[hotdealType].map(([offset, color]) => (
              <Stop key={offset} offset={offset} stopColor={color} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#g)" />
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
    // ★여백은 바깥 View 가 아니라 글자에. View 에 두면 absoluteFill Svg 의 width 100% 가
    // 여백을 뺀 폭(57-8=49)으로 풀려 그라디언트가 오른쪽 8pt 를 못 채운다(모서리가 잘려 보임).
    paddingHorizontal: 4,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
