import React, {useMemo, useState} from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import {useQuery} from '@tanstack/react-query';

import {ProductQueries} from '@/entities/product/product.queries';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {cn} from '@/shared/lib/styling';
import Thumbnail from '@/shared/components/product/Thumbnail';

import {
  MAX_DAYS,
  PERIODS,
  parsePointDateMs,
  resolveContentRangeMs,
  withAxisBuffer,
  won,
} from '../model/chart-geometry';
import {
  isSeedDeal,
  postedAtToKstDate,
  resolveCurrentProductMarker,
  toKstDateString,
} from '../model/seed-marker';
import {
  formatPreviewDate,
  formatRangeLabel,
  pickDefaultDays,
  resolveCurrentPriceBadge,
  resolveSubtitle,
} from '../model/price-summary';
import SectionErrorRow from '@/shared/components/SectionErrorRow';

import PriceChart from './PriceChart';

/** 미리보기 카드 한 장. 점(딜)이든 '이 상품'이든 같은 모양으로 그린다. */
type PreviewDeal = {
  id: number;
  title: string;
  thumbnail?: string | null;
  providerName?: string | null;
  price: number;
  currency?: string | null;
};

export default function PriceHistorySection({
  productId,
  currentPrice,
  postedAt,
  productTitle,
  productThumbnail,
  onPressProduct,
  onLayout,
}: {
  productId: number;
  /** 상세의 현재가. web 은 요약 카드 가운데에 이걸 띄운다. */
  currentPrice?: number | null;
  /** 이 상품 게시일 — seed 마커를 오늘로 합성하지 않기 위해 쓴다. */
  postedAt?: string | null;
  /** 이력에 seed 점이 없을 때 '이 상품' 미리보기에 쓸 제목·썸네일. */
  productTitle?: string | null;
  productThumbnail?: string | null;
  /** 미리보기 카드를 누르면 그 딜 상세로(web 은 `/products/{id}` 링크). */
  onPressProduct?: (id: number) => void;
  /** 판정 카드의 "기준 보기"가 여기로 스크롤하려고 위치를 잰다(web `#price-history`). */
  onLayout?: (e: LayoutChangeEvent) => void;
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
              title:
                p.deal.displayTitle || p.deal.title || `상품 #${p.deal.id}`,
              thumbnail: p.deal.thumbnail,
              providerName: p.deal.providerName,
              priceCurrency: p.deal.priceCurrency,
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

  // 기본 기간 — web pickDefaultDays: 이 상품 게시 나이를 덮는 탭을 먼저 고르고,
  // 점이 너무 적으면 더 긴 탭으로 넓힌다(빈 차트 방지).
  const resolvedDays = useMemo(() => {
    if (days != null) return days;
    const fromPosted = postedAtToKstDate(postedAt);
    const seedPoint = allPoints.find(p => isSeedDeal(p.deal, productId));
    const seedDate = fromPosted ?? seedPoint?.date ?? null;
    const seedMs = seedDate ? parsePointDateMs(seedDate) : null;
    return pickDefaultDays(periodStates, seedMs, Date.now());
  }, [days, allPoints, periodStates, postedAt, productId]);

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
  // 현재가는 이 상품가(기간 밖이어도 표시). 없으면 마커 → 마지막 점 순으로 폴백(web 과 같음).
  const shownCurrentPrice =
    typeof currentPrice === 'number' && currentPrice > 0
      ? currentPrice
      : currentMarker?.price ?? points[points.length - 1]?.price;
  const currentBadge =
    shownCurrentPrice != null
      ? resolveCurrentPriceBadge(
          shownCurrentPrice,
          minPrice,
          maxPrice,
          currency,
        )
      : null;
  const visiblePeriods = periodStates.filter(p => p.enabled);
  const rangeLabel = formatRangeLabel(
    toKstDateString(content.contentStartMs),
    toKstDateString(content.contentEndMs),
  );

  // 미리보기: 점을 누르기 전엔 '이 상품'(web 기본 선택과 같음), 누르면 그 점의 딜.
  const selected = selectedIndex != null ? points[selectedIndex] : null;
  const seedPoint = allPoints.find(p => isSeedDeal(p.deal, productId));
  let preview: {date: string; deal: PreviewDeal; isCurrent: boolean} | null =
    null;
  if (selected?.deal) {
    preview = {
      date: selected.date,
      isCurrent: isSeedDeal(selected.deal, productId),
      deal: {
        id: selected.deal.id,
        title: selected.deal.title,
        thumbnail: selected.deal.thumbnail,
        providerName: selected.deal.providerName,
        price: selected.deal.parsedPrice ?? selected.price,
        currency: selected.deal.priceCurrency ?? currency,
      },
    };
  } else if (currentMarker) {
    preview = {
      date: currentMarker.date,
      isCurrent: true,
      deal: seedPoint?.deal
        ? {
            id: seedPoint.deal.id,
            title: seedPoint.deal.title,
            thumbnail: seedPoint.deal.thumbnail,
            providerName: seedPoint.deal.providerName,
            price: currentMarker.price,
            currency: seedPoint.deal.priceCurrency ?? currency,
          }
        : {
            id: productId,
            title: productTitle || `상품 #${productId}`,
            thumbnail: productThumbnail,
            price: currentMarker.price,
            currency,
          },
    };
  }

  return (
    <View className="pt-7" onLayout={onLayout}>
      <Text className="px-5 text-lg font-semibold text-gray-900">
        가격 추이
      </Text>
      <Text className="px-5 pt-1 text-sm text-gray-500">
        {resolveSubtitle(data)}
      </Text>

      {/* web 처럼 쓸 수 있는 기간만 보이고, 하나뿐이면 탭 줄 자체를 숨긴다. */}
      {visiblePeriods.length > 1 ? (
        <View className="flex-row flex-wrap gap-1.5 px-5 pt-4">
          {visiblePeriods.map(period => {
            const active = resolvedDays === period.days;
            return (
              <Pressable
                key={period.days}
                onPress={() => {
                  setDays(period.days);
                  setSelectedIndex(null);
                }}
                // iOS HIG 최소 44px.
                style={{minHeight: 44}}
                className={cn(
                  'justify-center rounded-lg border px-3',
                  active
                    ? 'border-gray-900 bg-gray-900'
                    : 'border-gray-200 bg-white',
                )}
                accessibilityRole="button"
                accessibilityState={{selected: active}}
                accessibilityLabel={`${period.label} 기간`}>
                <Text
                  className={cn(
                    'text-sm',
                    active ? 'font-semibold text-white' : 'text-gray-600',
                  )}>
                  {period.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <Text className="px-5 pt-2 text-xs text-gray-400">
        이 기간 핫딜 {points.length}건 · {rangeLabel}
      </Text>

      {/* web 과 같은 3열 요약 카드. 최저=error, 최고=secondary 로 색을 나눈다. */}
      <View className="mx-5 mt-3 rounded-xl bg-gray-50 px-4 py-3.5">
        <View className="flex-row">
          <View className="flex-1 gap-y-0.5">
            <Text className="text-xs text-gray-500">최저</Text>
            <Text className="text-sm font-bold text-error-500">
              {won(minPrice, currency)}
            </Text>
          </View>
          <View className="flex-1 items-center gap-y-0.5">
            <Text className="text-xs text-gray-500">현재가</Text>
            <Text className="text-sm font-bold text-gray-900">
              {shownCurrentPrice != null
                ? won(shownCurrentPrice, currency)
                : '-'}
            </Text>
          </View>
          <View className="flex-1 items-end gap-y-0.5">
            <Text className="text-xs text-gray-500">최고</Text>
            <Text className="text-sm font-bold text-secondary-600">
              {won(maxPrice, currency)}
            </Text>
          </View>
        </View>
        {/* 가운데 칸(≈100px)엔 "최고 대비 N원 절약"(≈103px)이 안 들어가 두 줄로 꺾였다(web 은 v1.22.16 에서 수정).
            RN Text 는 칸 밖으로 넘칠 수 없어 카드 폭 전체에 가운데 정렬로 뺀다 — 가운데 칸도 가운데 정렬이라 위치는 같다. */}
        {currentBadge ? (
          <Text className="mt-0.5 text-center text-[11px] font-medium text-emerald-600">
            {currentBadge}
          </Text>
        ) : null}
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

      {preview ? (
        <DealPreview
          date={preview.date}
          deal={preview.deal}
          isCurrent={preview.isCurrent}
          onPress={
            // 지금 보는 상품이면 같은 화면을 또 쌓지 않는다.
            onPressProduct && preview.deal.id !== productId
              ? () => {
                  Analytics.track('product_card_click', {
                    source: 'price_history',
                    product_id: String(preview.deal.id),
                  });
                  onPressProduct(preview.deal.id);
                }
              : undefined
          }
        />
      ) : null}
    </View>
  );
}

/** web DealPreview 와 같은 구성 — 날짜 줄 + 썸네일·제목·출처·가격 한 줄. */
function DealPreview({
  date,
  deal,
  isCurrent,
  onPress,
}: {
  date: string;
  deal: PreviewDeal;
  isCurrent: boolean;
  onPress?: () => void;
}) {
  return (
    <View className="mx-5 mt-3 rounded-xl border border-gray-200 bg-white p-2.5">
      <View className="mb-1.5 h-4 flex-row items-center gap-x-2">
        <View
          className={cn(
            'size-1.5 rounded-full',
            isCurrent ? 'bg-[#467DFB]' : 'opacity-0',
          )}
        />
        <Text className="text-[11px] text-gray-400" numberOfLines={1}>
          {formatPreviewDate(date)}
          {isCurrent ? ' · 이 상품' : ''}
        </Text>
      </View>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        className="flex-row items-center gap-x-2.5"
        accessibilityRole={onPress ? 'link' : undefined}>
        <View className="size-11 overflow-hidden rounded-md bg-gray-50">
          <Thumbnail uri={deal.thumbnail} resizeMode="contain" />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-xs text-gray-900" numberOfLines={1}>
            {deal.title}
          </Text>
          {deal.providerName ? (
            <Text
              className="mt-0.5 text-[11px] text-gray-400"
              numberOfLines={1}>
              {deal.providerName}
            </Text>
          ) : null}
        </View>
        <Text className="text-xs font-semibold text-error-500">
          {won(deal.price, deal.currency)}
        </Text>
      </Pressable>
    </View>
  );
}
