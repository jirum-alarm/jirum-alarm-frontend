import React from 'react';
import {View} from 'react-native';
import Badge, {type BadgeProps} from '@/shared/components/ui/Badge';
import {
  TOSS_BADGE_EXPLAIN,
  type TossBadgeKey,
} from '@jirum/domain/badge-explain';

import ExplainedBadge from './ExplainedBadge';

import type {TossData} from '../model/types';

/**
 * 토스 딜 신뢰 배지. web entities/product/ui/TossBadges.tsx 와 동일(같은 Badge 레시피).
 * 희소할수록 앞에. bestSeller 는 27/30 로 흔해 제외(카드 오버레이 전용).
 */
export default function TossBadges({
  toss,
  hidePriceSignals,
}: {
  toss?: TossData;
  hidePriceSignals?: boolean;
}) {
  if (!toss) return null;

  const badges: {key: TossBadgeKey; label: string; tone: BadgeProps['tone']}[] =
    [];
  if (!hidePriceSignals && toss.lowestPriceCompensation) {
    badges.push({key: 'lpc', label: '최저가 보상', tone: 'secondary'});
  }
  if (toss.arrivalGuaranteed) {
    badges.push({key: 'ag', label: '도착보장', tone: 'success'});
  }
  if (toss.specialProduct) {
    badges.push({key: 'sp', label: '토스특가', tone: 'error'});
  }
  if (!hidePriceSignals && toss.lowestIn30Days) {
    badges.push({key: 'l30', label: '30일 최저가', tone: 'error'});
  }

  if (badges.length === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-1.5 pt-2">
      {/* 누르면 뜻(정본 @jirum/domain/badge-explain — web 과 같은 문구). */}
      {badges.map(b => (
        <ExplainedBadge
          key={b.key}
          label={b.label}
          lines={TOSS_BADGE_EXPLAIN[b.key]}>
          <Badge size="md" tone={b.tone}>
            {b.label}
          </Badge>
        </ExplainedBadge>
      ))}
    </View>
  );
}
