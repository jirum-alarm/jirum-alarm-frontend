'use client';

import { tab } from '@jirum/design-system/recipes';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { ProductService } from '@/shared/api/product';
import { cn } from '@/shared/lib/cn';
import { Skeleton } from '@/shared/ui/common/Skeleton';
import DetailSectionHeader from '@/shared/ui/DetailSectionHeader';

import { ProductQueries } from '@/entities/product';

import { useRegisterSection } from '../hooks/useSectionPresence';
import {
  computePeriodStates,
  filterPointsByRange,
  formatRangeLabel,
  MAX_DAYS,
  parsePointDateMs,
  pickDefaultDays,
  resolveContentRangeMs,
  resolveCurrentProductMarker,
  resolvePeriodStartMs,
  resolveSeedMs,
  resolveSubtitle,
  toKstDateString,
  withAxisBuffer,
  won,
} from '../lib/price-history';

import PriceLineChart from './PriceLineChart';

type Props = {
  productId: number;
  /** user_history source — detail_mobile | detail_desktop */
  source: string;
  /** 상세 현재가 — seed 점이 빠졌을 때 폴백 */
  currentPrice?: number | null;
  /** 이 상품 게시일 — 기간 필터로 seed가 잘려도 오늘로 찍지 않기 위함 */
  postedAt?: string | null;
};

/**
 * 상세 핫딜가 추이 — 기간 탭 + 최저/지금/최고 + 라인 차트.
 */
export default function PriceHistorySection({
  productId,
  source,
  currentPrice: currentPriceProp,
  postedAt,
}: Props) {
  const [mounted, setMounted] = useState(false);
  /** null이면 데이터 기준 기본 기간 사용 */
  const [daysOverride, setDaysOverride] = useState<number | null>(null);
  const gradId = useId().replace(/:/g, '');
  // 선택 기간 X축은 항상 '오늘'이 오른쪽 끝
  // eslint-disable-next-line react-hooks/purity -- "오늘" 기준 시각을 상품·마운트 시점에 한 번 고정한다(useMemo 로 렌더마다 바뀌지 않음). 마운트 전 값은 쓰지 않는다(조회가 마운트 뒤).
  const nowMs = useMemo(() => Date.now(), [productId, mounted]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- 서버 렌더·하이드레이션 땐 차트를 그리지 않고(시각 기준이 서버/브라우저로 갈린다) 마운트 뒤에 조회를 켠다.
  useEffect(() => setMounted(true), []);
  // 상품이 바뀌면 기간 선택을 데이터 기준 기본값으로 되돌린다 — effect 대신 렌더 중 비교로.
  const [periodResetProductId, setPeriodResetProductId] = useState(productId);
  if (productId !== periodResetProductId) {
    setPeriodResetProductId(productId);
    setDaysOverride(null);
  }

  const { data, isLoading, isError, error } = useQuery({
    ...ProductQueries.priceHistory({ id: productId, days: MAX_DAYS }),
    enabled: mounted,
  });

  const history = data?.product?.priceHistory ?? null;
  const allPoints = history?.points ?? [];

  const seedMs = useMemo(
    () => resolveSeedMs(postedAt, allPoints, productId),
    [postedAt, allPoints, productId],
  );

  const periodStates = useMemo(() => computePeriodStates(allPoints, nowMs), [allPoints, nowMs]);

  const defaultDays = useMemo(
    () => pickDefaultDays(periodStates, seedMs, nowMs),
    [periodStates, seedMs, nowMs],
  );
  const days = useMemo(() => {
    const preferred = daysOverride ?? defaultDays;
    if (periodStates.some((s) => s.days === preferred && s.enabled)) return preferred;
    return defaultDays;
  }, [daysOverride, defaultDays, periodStates]);

  // 선택 기간만 표시 (seed가 더 과거여도 축을 늘리지 않음)
  const periodStartMs = useMemo(() => resolvePeriodStartMs(nowMs, days), [nowMs, days]);
  const { contentStartMs, contentEndMs } = useMemo(
    () => resolveContentRangeMs(nowMs, days),
    [nowMs, days],
  );
  const { axisStartMs, axisEndMs } = useMemo(
    () => withAxisBuffer(contentStartMs, contentEndMs),
    [contentStartMs, contentEndMs],
  );

  const points = useMemo(
    () => filterPointsByRange(allPoints, periodStartMs, contentEndMs),
    [allPoints, periodStartMs, contentEndMs],
  );

  // 선택 기간 안에 있는 seed만 마커로 표시 (기간 밖 과거 상품은 축을 잡아먹지 않음)
  const currentMarker = useMemo(() => {
    const marker = resolveCurrentProductMarker(allPoints, productId, currentPriceProp, postedAt);
    if (!marker) return null;
    const t = parsePointDateMs(marker.date);
    if (!Number.isFinite(t) || t < periodStartMs || t > contentEndMs) return null;
    return marker;
  }, [allPoints, productId, currentPriceProp, postedAt, periodStartMs, contentEndMs]);

  // 노출은 섹션이 실제로 그려질 때(아래 early return 을 통과할 때) 상세 진입당 1회, 점 선택도 첫 1회만.
  // holdout(가치 실험) 기기는 차트 대신 "그려졌을 노출"만 price_history_holdout 으로 남긴다.
  const shown = !isError && !!history && allPoints.length >= 2 && points.length >= 2;
  const basis = history?.basis;
  const holdout = !!history?.holdout;
  // 가격 아래 근거 블록의 「근거 보기 ›」는 이 섹션이 그려졌을 때만 뜬다(아래 early return 과 같은 조건).
  useRegisterSection('price-history', mounted && !isLoading && shown && !holdout);
  const impressedRef = useRef<number | null>(null);
  const pointClickedRef = useRef<number | null>(null);
  useEffect(() => {
    if (!shown || impressedRef.current === productId) return;
    impressedRef.current = productId;
    void ProductService.collectPriceContextImpression({
      productId,
      source,
      detail: `${holdout ? 'price_history_holdout' : 'price_history'}:${basis}`,
    }).catch(() => {});
  }, [shown, basis, holdout, productId, source]);

  const trackClick = (element: 'period' | 'point' | 'deal') => {
    if (element === 'point') {
      if (pointClickedRef.current === productId) return;
      pointClickedRef.current = productId;
    }
    void ProductService.collectPriceContextClick({
      productId,
      source,
      detail: `price_history:${element}`,
    }).catch(() => {});
  };

  if (mounted && isError && process.env.NODE_ENV === 'development') {
    return (
      <section className="py-0">
        <DetailSectionHeader title="가격 추이" />
        <p className="text-error-600 mt-2 text-xs">
          priceHistory 조회 실패: {error instanceof Error ? error.message : 'unknown'}
        </p>
      </section>
    );
  }

  if (!mounted) return null;

  if (isLoading) {
    return (
      <section className="py-0">
        <Skeleton className="h-7 w-28 rounded" />
        <Skeleton className="mt-3 h-9 rounded-lg" />
        <Skeleton className="mt-3 h-16 rounded-xl" />
        <Skeleton className="mt-3 h-52 rounded-xl" />
      </section>
    );
  }

  // 이 상품은 추이 데이터 없음 → 섹션 자체 숨김
  if (isError || !history || allPoints.length < 2) return null;
  if (points.length < 2) return null;
  if (holdout) return null;

  const currency = history.currency;
  const orderedForMeta = [...points].sort(
    (a, b) => parsePointDateMs(a.date) - parsePointDateMs(b.date),
  );
  // 최저/최고는 선택 기간 점만. 현재가는 이 상품가(기간 밖이어도 표시).
  const prices = points.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice =
    typeof currentPriceProp === 'number' && currentPriceProp > 0
      ? currentPriceProp
      : (currentMarker?.price ?? orderedForMeta[orderedForMeta.length - 1]?.price);
  // 축·문구: 선택한 기간만 (왼쪽=기간 시작, 오른쪽=오늘)
  const rangeFromLabel = toKstDateString(contentStartMs);
  const rangeToLabel = toKstDateString(contentEndMs);
  const visiblePeriods = periodStates.filter((p) => p.enabled);

  const subtitle = resolveSubtitle(history);

  // 유사(SIMILAR) 추이에서는 모델 페이지로 보내지 않음 — 틀린 연결 방지.
  // confidence 게이트는 뺐다: HIGH 를 요구하니 발행 85개가 커버하는 딜 2,469건 중 극소수만
  // CTA 가 떠서 /deals/ 노출이 23페이지(GSC 실측)에 갇혀 있었다. CTA 는 "핫딜 모음" 링크라
  // 가격추이 차트의 신뢰도와 직접 상관이 없고, 오연결 위험은 basis 검사로 이미 막힌다.
  return (
    <section id="price-history" className="py-0">
      <DetailSectionHeader title="가격 추이" subtitle={subtitle} />

      {visiblePeriods.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {visiblePeriods.map((p) => {
            const active = days === p.days;
            const t = active ? tab.segment.selected : tab.segment.idle;
            return (
              <button
                key={p.days}
                type="button"
                onClick={() => {
                  setDaysOverride(p.days);
                  trackClick('period');
                }}
                aria-pressed={active}
                className={cn('transition-colors', tab.size.sm, t.box, t.text, t.hover)}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-2 text-xs text-gray-500">
        이 기간 핫딜 {points.length}건{` · ${formatRangeLabel(rangeFromLabel, rangeToLabel)}`}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-gray-50 px-4 py-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-500">최저</span>
          <span className="text-error-600 text-sm font-bold sm:text-base">
            {won(minPrice, currency)}
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs text-gray-500">현재가</span>
          <span className="text-sm font-bold text-gray-900 sm:text-base">
            {won(currentPrice, currency)}
          </span>
          {/* 「기간 최저」·「최고 대비 N원 절약」은 뺐다 — 고른 기간 기준이라 1년 보통가 기준인
              근거 블록과 같은 상품에 다른 판정을 냈다. 판정은 가격 아래 근거 블록이 맡는다. */}
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-xs text-gray-500">최고</span>
          <span className="text-secondary-600 text-sm font-bold sm:text-base">
            {won(maxPrice, currency)}
          </span>
        </div>
      </div>

      <PriceLineChart
        key={`${productId}-${days}`}
        productId={productId}
        points={points}
        currentMarker={currentMarker}
        currency={currency}
        minPrice={minPrice}
        maxPrice={maxPrice}
        gradId={gradId}
        axisStartMs={axisStartMs}
        axisEndMs={axisEndMs}
        contentStartMs={contentStartMs}
        contentEndMs={contentEndMs}
        onTrackClick={trackClick}
      />
    </section>
  );
}
