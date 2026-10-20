import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {ESTIMATED_TOTAL_CAP} from '@jirum/domain/search';

import {SearchQueries} from '@/entities/search/api/search.queries';
import PressableScale from '@/shared/components/PressableScale';
import {Text} from '@/shared/components/ui/Text/AppText';
import {Analytics} from '@/shared/lib/analytics/ga4';

/**
 * 진짜 0건(필터 없음·종료 제외)일 때 "종료된 딜 N건 보기". web: widgets/search/ui/EndedDealsRescue.tsx
 *
 * 검색은 기본으로 종료(품절) 딜을 빼서, 지난 딜만 있는 검색어도 "결과 없음"으로 끝났다.
 * 누르면 필터 바의 '품절 포함'을 켠 것과 같다. 종료 딜도 없으면 아무것도 그리지 않는다.
 */
export default function EndedDealsRescue({
  keyword,
  onShowEnded,
}: {
  keyword: string;
  onShowEnded: () => void;
}) {
  const {data} = useQuery(SearchQueries.endedCount(keyword));
  const hasEnded = data?.hasEnded ?? false;
  const count = data?.count ?? null;

  useEffect(() => {
    if (!hasEnded) return;
    Analytics.track('search_ended_rescue_view', {keyword, count});
  }, [hasEnded, keyword, count]);

  if (!hasEnded) return null;

  const countLabel =
    count != null && count > 0
      ? ` ${count.toLocaleString()}건${count >= ESTIMATED_TOTAL_CAP ? '+' : ''}`
      : '';
  const label = `종료된 딜${countLabel} 보기`;

  return (
    <View className="mx-5 mb-6 flex-row items-center gap-x-3 rounded-xl bg-gray-50 py-2 pl-4 pr-2">
      <Text className="min-w-0 flex-1 text-sm text-gray-700">
        진행 중인 딜은 없어요
      </Text>
      <PressableScale
        onPress={() => {
          Analytics.track('search_ended_rescue_click', {keyword, count});
          onShowEnded();
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
        className="h-9 flex-row items-center rounded-lg border border-gray-300 bg-white px-3">
        <Text className="text-sm font-semibold text-gray-900">{label}</Text>
      </PressableScale>
    </View>
  );
}
