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
import {resolveCurrentProductMarker} from '../model/seed-marker';
import SectionErrorRow from '@/shared/components/SectionErrorRow';

import PriceChart from './PriceChart';

export default function PriceHistorySection({
  productId,
  currentPrice,
  postedAt,
}: {
  productId: number;
  /** 상세의 현재가. web 은 요약 카드 가운데에 이걸 띄운다. */
  currentPrice?: number | null;
  /** 이 상품 게시일 — seed 마커를 오늘로 합성하지 않기 위해 쓴다. */
  postedAt?: string | null;
}) {
  const {data, isPending, isError, refetch} = useQuery(
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
        deal: p.deal
          ? {
              id: p.deal.id,
              isSeed: p.deal.isSeed,
              parsedPrice: p.deal.parsedPrice,
            }
          : null,
      })),
    [data],
  );

  const currentMarker = useMemo(
    () =>
      resolveCurrentProductMarker(allPoints, productId, currentPrice, postedAt),
    [allPoints, productId, currentPrice, postedAt],
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

  /**
   * 기간 탭 활성 여부. web buildPeriodStates 와 같은 규칙 —
   * 점이 2개 미만이면 비활성, 앞 탭과 데이터가 같으면(더 넓혀도 같은 점들)
   * 중복이라 비활성. 이걸 안 하면 1개월을 눌렀을 때 points<2 로 섹션 전체가
   * 사라진다(사용자 신고 2026-08-13).
   */
  const periodStates = useMemo(() => {
    const nowMs = Date.now();
    let prevKey = '';
    return PERIODS.map(p => {
      const from = nowMs - p.days * 24 * 60 * 60 * 1000;
      const pts = allPoints.filter(x => parsePointDateMs(x.date) >= from);
      const key = pts.map(x => x.date).join('|');
      const enabled = pts.length >= 2 && key !== prevKey;
      if (enabled) prevKey = key;
      return {...p, enabled, count: pts.length};
    });
  }, [allPoints]);

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

  if (isError) {
    return <SectionErrorRow label="가격 추이" onRetry={refetch} />;
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
        {periodStates.map(period => {
          const active = resolvedDays === period.days;
          const disabled = !period.enabled;
          return (
            <Pressable
              key={period.days}
              onPress={() => {
                if (disabled) return;
                setDays(period.days);
                setSelectedIndex(null);
              }}
              disabled={disabled}
              // iOS HIG 최소 44px. 기존 py-1 은 약 26px 이라 오탭이 났다.
              style={{minHeight: 44}}
              className={cn(
                'justify-center rounded-full px-4',
                active ? 'bg-gray-900' : 'bg-gray-100',
                disabled && 'opacity-40',
              )}
              accessibilityRole="button"
              accessibilityState={{selected: active}}
              accessibilityLabel={`${period.label} 기간`}>
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

      {/* web 과 같은 3열 요약 카드. 최저=error, 최고=secondary 로 색을 나눈다. */}
      <View className="mx-5 mt-3 flex-row rounded-xl bg-gray-50 px-4 py-3.5">
        <View className="flex-1 gap-y-0.5">
          <Text className="text-xs text-gray-500">최저</Text>
          <Text className="text-sm font-bold text-error-500">
            {won(minPrice, currency)}
          </Text>
        </View>
        <View className="flex-1 items-center gap-y-0.5">
          <Text className="text-xs text-gray-500">현재가</Text>
          <Text className="text-sm font-bold text-gray-900">
            {currentPrice != null ? won(currentPrice, currency) : '-'}
          </Text>
        </View>
        <View className="flex-1 items-end gap-y-0.5">
          <Text className="text-xs text-gray-500">최고</Text>
          <Text className="text-sm font-bold text-secondary-600">
            {won(maxPrice, currency)}
          </Text>
        </View>
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
          currentMarker={currentMarker}
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
