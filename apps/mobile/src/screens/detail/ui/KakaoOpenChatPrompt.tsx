import React from 'react';
import {Text, View} from 'react-native';

import PressableScale from '@/shared/components/PressableScale';
import TalkLight from '@/shared/components/icons/TalkLight';

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
    <PressableScale
      onPress={() => openInAppBrowser(href)}
      className="mx-5 mb-4 flex-row items-center gap-x-3 rounded-lg bg-secondary-50 px-4 py-3"
      accessibilityRole="button"
      accessibilityLabel="핫딜 카톡방 입장">
      <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FAE300]">
        <TalkLight width={18} height={18} style={{marginTop: 2}} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold text-gray-800">
          핫딜 Only 오픈 카톡방 입장하기
        </Text>
        <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
          지름알림이 엄선한 핫딜만 골라 받아보세요!
        </Text>
      </View>
      {/* secondary-500 은 이 연한 파란 면에서 3.50:1 로 AA 미달 — 600 이 5.11:1. */}
      <Text className="shrink-0 text-xs font-semibold text-secondary-600">
        입장
      </Text>
    </PressableScale>
  );
}
