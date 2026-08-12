import React, {useMemo, useState} from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';

import {ProductQueries} from '@/entities/product/product.queries';
import {cn} from '@/shared/lib/styling';

import {
  DEFAULT_PERIOD_DAYS,
  MAX_DAYS,
  MIN_DEFAULT_POINTS,
  PERIODS,
  parsePointDateMs,
  resolveContentRangeMs,
  withAxisBuffer,
  won,
} from '../model/chart-geometry';
import PriceChart from './PriceChart';

export default function PriceHistorySection({productId}: {productId: number}) {
  const {data, isPending} = useQuery(
    ProductQueries.priceHistory({id: productId, days: MAX_DAYS}),
  );

  const [days, setDays] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const allPoints = useMemo(
    () =>
      (data?.points ?? []).map(p => ({
        date: p.date,
        price: p.price,
        dealTitle: p.deal?.displayTitle || p.deal?.title || '',
      })),
    [data],
  );

  // 기본 기간에 점이 너무 적으면 더 긴 기간으로 확장한다(빈 차트 방지).
  const resolvedDays = useMemo(() => {
    if (days != null) return days;
    const nowMs = Date.now();
    for (const period of PERIODS) {
      if (period.days < DEFAULT_PERIOD_DAYS) continue;
      const from = nowMs - period.days * 24 * 60 * 60 * 1000;
      const count = allPoints.filter(
        p => parsePointDateMs(p.date) >= from,
      ).length;
      if (count >= MIN_DEFAULT_POINTS) return period.days;
    }
    return MAX_DAYS;
  }, [days, allPoints]);

  const {points, axis, content} = useMemo(() => {
    const nowMs = Date.now();
    const range = resolveContentRangeMs(nowMs, resolvedDays);
    return {
      points: allPoints.filter(
        p => parsePointDateMs(p.date) >= range.contentStartMs,
      ),
      axis: withAxisBuffer(range.contentStartMs, range.contentEndMs),
      content: range,
    };
  }, [allPoints, resolvedDays]);

  if (isPending) {
    return (
      <View className="h-[220px] items-center justify-center">
        <ActivityIndicator size="small" color="#667085" />
      </View>
    );
  }

  // 가격 이력은 매핑된 상품에만 있다. 대부분은 null 이므로 조용히 숨긴다.
  if (!data || points.length < 2) return null;

  const currency = data.currency;
  const prices = points.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const selected = selectedIndex != null ? points[selectedIndex] : null;

  return (
    <View className="pt-7">
      <Text className="px-5 text-lg font-semibold text-gray-900">
        핫딜가 추이
      </Text>
      {data.disclaimer ? (
        <Text className="px-5 pt-1 text-xs text-gray-500">
          {data.disclaimer}
        </Text>
      ) : null}

      <View className="flex-row gap-x-2 px-5 pt-3">
        {PERIODS.map(period => {
          const active = resolvedDays === period.days;
          return (
            <Pressable
              key={period.days}
              onPress={() => {
                setDays(period.days);
                setSelectedIndex(null);
              }}
              className={cn(
                'rounded-full px-3 py-1',
                active ? 'bg-gray-900' : 'bg-gray-100',
              )}
              accessibilityRole="button">
              <Text
                className={cn(
                  'text-xs font-medium',
                  active ? 'text-white' : 'text-gray-600',
                )}>
                {period.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row justify-between px-5 pt-4">
        <Text className="text-sm text-gray-500">
          최저{' '}
          <Text className="font-semibold text-gray-900">
            {won(minPrice, currency)}
          </Text>
        </Text>
        <Text className="text-sm text-gray-500">
          최고{' '}
          <Text className="font-semibold text-gray-900">
            {won(maxPrice, currency)}
          </Text>
        </Text>
      </View>

      <View className="px-2 pt-2">
        <PriceChart
          points={points}
          currency={currency}
          axisStartMs={axis.axisStartMs}
          axisEndMs={axis.axisEndMs}
          contentStartMs={content.contentStartMs}
          contentEndMs={content.contentEndMs}
          selectedIndex={selectedIndex}
          onSelectIndex={setSelectedIndex}
        />
      </View>

      {selected ? (
        <View className="mx-5 mt-2 rounded-lg bg-gray-50 px-4 py-3">
          <Text className="text-sm font-semibold text-gray-900">
            {won(selected.price, currency)}
          </Text>
          <Text className="pt-0.5 text-xs text-gray-500" numberOfLines={1}>
            {selected.date}
            {selected.dealTitle ? ` · ${selected.dealTitle}` : ''}
          </Text>
        </View>
      ) : (
        <Text className="px-5 pt-2 text-xs text-gray-500">
          그래프를 눌러 날짜별 가격을 확인하세요
        </Text>
      )}
    </View>
  );
}
