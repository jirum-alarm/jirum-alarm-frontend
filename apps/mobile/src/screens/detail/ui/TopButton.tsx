import React, {useEffect, useRef} from 'react';
import {Animated, Text, View} from 'react-native';

import PressableScale from '@/shared/components/PressableScale';

/**
 * 맨 위로. web TopButton 과 같은 형태 —
 * CTA 바 "위에 떠 있는" 40px 원(absolute -top-14 right-16)이고,
 * 스크롤을 올릴 때만 보인다(그 외에는 opacity 0).
 *
 * 내가 처음엔 48px 원을 CTA 바 안에 상시로 넣었었다. 그러면 찜하기·구매와
 * 나란히 서서 같은 급의 액션처럼 읽히는데, 실제로는 보조 기능이다.
 */
export default function TopButton({
  visible,
  onPress,
}: {
  visible: boolean;
  onPress: () => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={{opacity, position: 'absolute', right: 16, top: -56, zIndex: 50}}>
      <PressableScale onPress={onPress} accessibilityLabel="스크롤 최상단 이동">
        <View
          className="h-[40px] w-[40px] items-center justify-center rounded-full border border-gray-300 bg-white"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: {width: 0, height: 2},
            elevation: 3,
          }}>
          <Text className="text-base text-gray-600">↑</Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
}
