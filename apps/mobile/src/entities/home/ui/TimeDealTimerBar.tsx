import React from 'react';
import {View} from 'react-native';
import {formatCountdown, nextKstMidnight} from '@jirum/domain/toss-time-deal';

import {Text} from '@/shared/components/ui/Text/AppText';
import {useNow} from '@/shared/hooks/useNow';
import {cn} from '@/shared/lib/styling';

/** 「선착순·타임특가」 섹션 id — 홈 섹션·더보기가 이 섹션에만 타이머를 단다. */
export const TIME_DEAL_SECTION_ID = 'time-deal';

/**
 * 「오늘 특가 종료까지 3:07:09 · 밤 12시 새 특가 오픈」 — 토스 앱 하루특가 상단 타이머와 같은 역할.
 * 토스 하루특가는 전부 KST 자정에 끝나고 그 순간 다음 날 특가가 열려 타이머 하나가 종료·오픈을 같이 센다.
 * web entities/promotion/ui/TimeDealTimerBar 와 같다.
 */
export default function TimeDealTimerBar({className}: {className?: string}) {
  const now = useNow();
  return (
    <View
      className={cn('flex-row flex-wrap items-center gap-x-1.5', className)}>
      <Text className="text-sm text-gray-600">오늘 특가 종료까지</Text>
      <Text
        className="text-sm font-semibold text-error-600"
        style={{fontVariant: ['tabular-nums']}}>
        {formatCountdown(nextKstMidnight(now) - now)}
      </Text>
      <Text className="text-sm text-gray-500">· 밤 12시 새 특가 오픈</Text>
    </View>
  );
}
