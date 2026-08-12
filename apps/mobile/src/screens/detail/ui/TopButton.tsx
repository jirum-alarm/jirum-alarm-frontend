import React from 'react';
import {Text, View} from 'react-native';

import PressableScale from '@/shared/components/PressableScale';

/**
 * 맨 위로. web TopButton 은 스크롤을 올릴 때만 나타나는데, 상세 하단 CTA 옆에
 * 붙는 자리라 여기서는 항상 보인다(web 도 BottomCTA 안에서는 상시 노출).
 */
export default function TopButton({onPress}: {onPress: () => void}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="맨 위로">
      <View className="h-[48px] w-[48px] items-center justify-center rounded-full border border-gray-200 bg-white">
        <Text className="text-lg text-gray-700">↑</Text>
      </View>
    </PressableScale>
  );
}
