import React from 'react';
import {View} from 'react-native';

import {Text} from '@/shared/components/ui/Text/AppText';
import {
  buildKeywordHubFacts,
  findKeywordHubForQuery,
  formatHubCount,
} from '@/entities/keyword-hub/lib/keyword-hub';
import {useKeywordHubs} from '@/entities/keyword-hub/model/useKeywordHubs';

/**
 * 검색어가 키워드 허브 자체일 때("삼다수", "플스5") 결과 위에 30일 요약 한 줄 — "삼다수 핫딜 최근 30일 92건 ·
 * 30일 중 24일 · 주로 뽐뿌 24%". 얼마나 자주 올라오는지 알면 지금 살지 기다릴지 가늠할 수 있다.
 * web SearchKeywordHubCard 와 같은 숫자(웹은 허브 페이지로 가는 카드, 앱은 허브 화면이 없어 정보 줄).
 */
export default function SearchKeywordHubSummary({keyword}: {keyword: string}) {
  const {data: hubs} = useKeywordHubs();
  const hub = hubs ? findKeywordHubForQuery(keyword, hubs) : undefined;
  if (!hub || hub.recentDealCount <= 0) return null;

  const parts = [
    `최근 30일 ${formatHubCount(hub)}`,
    ...buildKeywordHubFacts(hub),
  ];
  return (
    <View className="px-5 pb-2">
      <Text className="text-sm text-gray-500" numberOfLines={2}>
        <Text className="font-semibold text-gray-900">{`${hub.name} 핫딜 `}</Text>
        {parts.join(' · ')}
      </Text>
    </View>
  );
}
