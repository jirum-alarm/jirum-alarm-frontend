import React from 'react';
import {Pressable, Text, View} from 'react-native';

import {openInAppBrowser} from '@/shared/lib/navigation';

/**
 * 상세페이지용 핫딜 카톡방 입장 안내.
 *
 * 주 유입 경로가 핫딜 단톡방인데 상세에는 방으로 돌아가는 문이 없었다.
 * 홈의 진한 배너를 그대로 쓰면 상세에서 가장 진한 요소가 되어 구매 CTA 와
 * 경합하므로, 연한 면 + 작은 아이콘 + 한 줄 안내로 낮춘다(web 과 동일 의도).
 */
export default function KakaoOpenChatPrompt({href}: {href: string}) {
  return (
    <Pressable
      onPress={() => openInAppBrowser(href)}
      className="mx-5 mb-4 flex-row items-center gap-x-3 rounded-lg bg-secondary-50 px-4 py-3"
      accessibilityRole="button"
      accessibilityLabel="핫딜 카톡방 입장">
      <View className="h-7 w-7 items-center justify-center rounded-full bg-[#FEE500]">
        <Text className="text-sm">💬</Text>
      </View>
      <Text className="flex-1 text-sm text-gray-700">
        핫딜 카톡방에서 실시간으로 받아보세요
      </Text>
      <Text className="text-sm font-medium text-gray-500">입장</Text>
    </Pressable>
  );
}
