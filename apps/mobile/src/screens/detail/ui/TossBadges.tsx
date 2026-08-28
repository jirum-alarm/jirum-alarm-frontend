import React from 'react';
import {Text, View} from 'react-native';

import type {TossData} from '../model/types';

/**
 * 토스 딜 신뢰 배지. web entities/product/ui/TossBadges.tsx 와 동일.
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

  const badges: {key: string; label: string; bg: string; fg: string}[] = [];
  if (!hidePriceSignals && toss.lowestPriceCompensation) {
    badges.push({
      key: 'lpc',
      label: '최저가 보상',
      bg: 'bg-blue-50',
      fg: 'text-blue-600',
    });
  }
  if (toss.arrivalGuaranteed) {
    badges.push({
      key: 'ag',
      label: '도착보장',
      bg: 'bg-green-50',
      fg: 'text-green-600',
    });
  }
  if (toss.specialProduct) {
    badges.push({
      key: 'sp',
      label: '토스특가',
      bg: 'bg-error-50',
      fg: 'text-error-600',
    });
  }
  if (!hidePriceSignals && toss.lowestIn30Days) {
    badges.push({
      key: 'l30',
      label: '30일 최저가',
      bg: 'bg-error-50',
      fg: 'text-error-600',
    });
  }

  if (badges.length === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-1.5 pt-2">
      {badges.map(b => (
        <View key={b.key} className={`rounded px-2 py-0.5 ${b.bg}`}>
          <Text className={`text-xs font-medium ${b.fg}`}>{b.label}</Text>
        </View>
      ))}
    </View>
  );
}
