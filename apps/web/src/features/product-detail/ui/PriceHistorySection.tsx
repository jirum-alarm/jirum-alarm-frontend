'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import type {
  PriceHistoryDeal,
  PriceHistoryPoint,
  ProductModelPageLink,
  ProductPriceHistory,
} from '@/shared/api/product/product.service';
import { cn } from '@/shared/lib/cn';
import DetailSectionHeader from '@/shared/ui/DetailSectionHeader';

import { ProductQueries } from '@/entities/product';

type Props = {
  productId: number;
  /** 상세 현재가 — seed 점이 빠졌을 때 폴백 */
  currentPrice?: number | null;
  /** 이 상품 게시일 — 기간 필터로 seed가 잘려도 오늘로 찍지 않기 위함 */
  postedAt?: string | null;
};

/** API는 최대 구간 한 번만 받고, 탭은 FE에서 자른다 */
const MAX_DAYS = 730;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 기본 노출 기간 — 3개월 */
const DEFAULT_PERIOD_DAYS = 90;
/** 기본 탭 점 수가 이보다 적으면 더 긴 기간으로 확장 */
const MIN_DEFAULT_POINTS = 5;
/** 차트 X축 좌우 여백 (콘텐츠 구간 대비) */
const X_AXIS_BUFFER_RATIO = 0.08;

const PERIODS = [
  { label: '1개월', days: 30 },
  { label: '3개월', days: 90 },
  { label: '6개월', days: 180 },
  { label: '12개월', days: 365 },
  { label: '24개월', days: 730 },
] as const;

function won(price: number, currency?: string | null): string {
  if (currency === 'USD') return `$${Math.round(price).toLocaleString()}`;
  return `${Math.round(price).toLocaleString()}원`;
}

/** 절약 카피 최소액 — 이하면 ‘N원 절약’이 초라해져 숨김 */
const MIN_SAVE_AMOUNT = (currency?: string | null) => (currency === 'USD' ? 1 : 1000);
/** 가격대 상위 구간(비싼 편) — 절약 카피 숨김 */
const EXPENSIVE_RATIO = 0.7;

/**
 * 현재가 배지: 최저 대비(+)가 아니라 최고 대비 절약(−)으로 프레이밍.
 * - 기간 최저 → 「기간 최저」
 * - 비싼 구간 / 절약액 미미 → 숨김
 * - 그 외 → 「최고 대비 N원 절약」
 */
function resolveCurrentPriceBadge(
  currentPrice: number,
  minPrice: number,
  maxPrice: number,
  currency?: string | null,
): { text: string; tone: 'positive' } | null {
  if (currentPrice <= minPrice) {
    return { text: '기간 최저', tone: 'positive' };
  }
  if (maxPrice <= minPrice) return null;

  const range = maxPrice - minPrice;
  const ratio = (currentPrice - minPrice) / range;
  if (ratio > EXPENSIVE_RATIO) return null;

  const saveAmount = maxPrice - currentPrice;
  if (saveAmount < MIN_SAVE_AMOUNT(currency)) return null;

  return { text: `최고 대비 ${won(saveAmount, currency)} 절약`, tone: 'positive' };
}

function shortWon(price: number, currency?: string | null): string {
  if (currency === 'USD') return `$${Math.round(price).toLocaleString()}`;
  if (price >= 10000) return `${Math.round(price / 1000).toLocaleString()}k`;
  return `${Math.round(price).toLocaleString()}`;
}

function formatAxisDate(date: string, withYear = false): string {
  const parts = date.split('-');
  if (parts.length !== 3) return date;
  const md = `${parts[1]}.${parts[2]}`;
  return withYear ? `${parts[0].slice(2)}.${md}` : md;
}

function formatAxisDateFromMs(ms: number, withYear = false): string {
  const d = new Date(ms);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return withYear ? `${yy}.${mm}.${dd}` : `${mm}.${dd}`;
}

function formatRangeLabel(from: string, to: string): string {
  const crossYear = from.slice(0, 4) !== to.slice(0, 4);
  return `${formatAxisDate(from, crossYear)} ~ ${formatAxisDate(to, crossYear)}`;
}

function parsePointDateMs(date: string): number {
  // YYYY-MM-DD → local midnight
  const parts = date.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return NaN;
  return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
}

function dealTitle(deal: PriceHistoryDeal): string {
  return deal.displayTitle || deal.title || `상품 #${deal.id}`;
}

function resolveSubtitle(history: ProductPriceHistory): string {
  if (history.basis === 'SIMILAR') {
    return '비슷한 상품 핫딜을 모아 참고용으로 보여드려요';
  }
  // brand_item SSOT(MAPPING HIGH)는 모델 라인 모음. 단위가 축은 /deals 전용이라 상세에선 안 씀.
  if (history.confidence === 'HIGH' && history.basis === 'MAPPING') {
    return '같은 모델의 커뮤니티 핫딜가를 모아 보여드려요';
  }
  return '같은 상품의 커뮤니티 핫딜가를 모아 보여드려요';
}

function sameProductId(a: number | string, b: number): boolean {
  return Number(a) === b;
}

function isSeedDeal(deal: PriceHistoryDeal, productId: number): boolean {
  return deal.isSeed || sameProductId(deal.id, productId);
}

function toKstDateString(ms: number): string {
  // en-CA → YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(ms));
}

type CurrentProductMarker = {
  date: string;
  price: number;
  deal: PriceHistoryDeal;
};

function postedAtToKstDate(postedAt?: string | null): string | null {
  if (!postedAt) return null;
  const ms = Date.parse(postedAt);
  if (!Number.isFinite(ms)) return null;
  return toKstDateString(ms);
}

/**
 * 라인(일별 최저)과 분리된 '지금 보는 상품' 마커.
 * 같은 날 다른 딜이 더 싸도 seed 실제가로 찍음.
 * 과거 상품은 postedAt 날짜에 찍고, 오늘로 합성하지 않음.
 */
function resolveCurrentProductMarker(
  points: PriceHistoryPoint[],
  productId: number,
  currentPrice: number | null | undefined,
  postedAt?: string | null,
): CurrentProductMarker | null {
  for (const p of points) {
    if (isSeedDeal(p.deal, productId)) {
      return { date: p.date, price: p.deal.parsedPrice, deal: { ...p.deal, isSeed: true } };
    }
    const inDeals = p.deals.find((d) => isSeedDeal(d, productId));
    if (inDeals) {
      return { date: p.date, price: inDeals.parsedPrice, deal: { ...inDeals, isSeed: true } };
    }
  }

  if (typeof currentPrice === 'number' && currentPrice > 0) {
    const date = postedAtToKstDate(postedAt);
    if (!date) return null;
    const synthetic: PriceHistoryDeal = {
      id: productId,
      title: '',
      displayTitle: null,
      parsedPrice: currentPrice,
      price: null,
      priceCurrency: null,
      postedAt: postedAt ?? date,
      thumbnail: null,
      providerId: 0,
      providerName: null,
      url: null,
      categoryId: null,
      isSeed: true,
    };
    return { date, price: currentPrice, deal: synthetic };
  }

  return null;
}

function filterPointsByRange(
  points: PriceHistoryPoint[],
  rangeStartMs: number,
  rangeEndMs: number,
): PriceHistoryPoint[] {
  return points.filter((p) => {
    const t = parsePointDateMs(p.date);
    return Number.isFinite(t) && t >= rangeStartMs && t <= rangeEndMs;
  });
}

function filterPointsByDays(
  points: PriceHistoryPoint[],
  days: number,
  nowMs: number,
): PriceHistoryPoint[] {
  return filterPointsByRange(points, nowMs - days * DAY_MS, nowMs);
}

/** 이 상품(seed) 게시일 — 축을 '그때~오늘'로 잡을 때 사용 */
function resolveSeedMs(
  postedAt: string | null | undefined,
  points: PriceHistoryPoint[],
  productId: number,
): number | null {
  const fromPosted = postedAtToKstDate(postedAt);
  if (fromPosted) {
    const t = parsePointDateMs(fromPosted);
    if (Number.isFinite(t)) return t;
  }
  for (const p of points) {
    if (isSeedDeal(p.deal, productId)) {
      const t = parsePointDateMs(p.date);
      if (Number.isFinite(t)) return t;
    }
    const inDeals = p.deals.find((d) => isSeedDeal(d, productId));
    if (inDeals) {
      const t = parsePointDateMs(p.date);
      if (Number.isFinite(t)) return t;
    }
  }
  return null;
}

function pointDateKey(points: PriceHistoryPoint[]): string {
  return points
    .map((p) => p.date)
    .sort()
    .join('|');
}

type PeriodState = {
  label: string;
  days: number;
  enabled: boolean;
  points: PriceHistoryPoint[];
};

/**
 * 점이 2개 미만이거나, 더 짧은 기간과 점이 동일하면(빈 칸만 늘어남) 비활성.
 */
function computePeriodStates(allPoints: PriceHistoryPoint[], nowMs: number): PeriodState[] {
  let prevKey: string | null = null;
  return PERIODS.map((p) => {
    const points = filterPointsByDays(allPoints, p.days, nowMs);
    const key = pointDateKey(points);
    const enabled = points.length >= 2 && key !== prevKey;
    if (enabled) prevKey = key;
    return { label: p.label, days: p.days, enabled, points };
  });
}

/**
 * 기본 기간:
 * 1) 이 상품(seed) 게시 나이를 덮는 가장 짧은 활성 탭 (예: ~20개월 전 → 24개월)
 * 2) 없으면 활성 탭 중 가장 긴 것
 * 3) 그래도 점이 MIN_DEFAULT_POINTS 미만이면 더 긴 탭으로 확장
 */
function pickDefaultDays(states: PeriodState[], seedMs: number | null, nowMs: number): number {
  const enabled = states.filter((s) => s.enabled).sort((a, b) => a.days - b.days);
  if (enabled.length === 0) return DEFAULT_PERIOD_DAYS;

  const ageDays =
    seedMs != null && Number.isFinite(seedMs) ? Math.max(0, (nowMs - seedMs) / DAY_MS) : 0;

  // seed 나이를 덮는 탭 우선 (짧→긴). 없으면 최장 탭.
  const covering = enabled.find((s) => s.days + 1 >= ageDays);
  const preferred = covering?.days ?? enabled[enabled.length - 1].days;

  // 그 탭 점이 너무 적으면 더 긴 활성 탭으로 확장
  const fromPreferred = enabled.filter((s) => s.days >= preferred);
  for (const s of fromPreferred) {
    if (s.points.length >= MIN_DEFAULT_POINTS) return s.days;
  }
  return fromPreferred[fromPreferred.length - 1]?.days ?? preferred;
}

/** 점 필터용 — 선택 기간의 왼쪽 경계(오늘 기준) */
function resolvePeriodStartMs(nowMs: number, days: number): number {
  return nowMs - days * DAY_MS;
}

/**
 * 차트 콘텐츠 구간 = 선택한 기간만.
 * (과거 seed 때문에 축을 늘리지 않음 — 3개월 탭이면 최근 3개월만)
 */
function resolveContentRangeMs(
  nowMs: number,
  days: number,
): { contentStartMs: number; contentEndMs: number } {
  return {
    contentStartMs: resolvePeriodStartMs(nowMs, days),
    contentEndMs: nowMs,
  };
}

/** 점이 축 끝에 붙지 않도록 콘텐츠 구간 양옆에 버퍼 */
function withAxisBuffer(contentStartMs: number, contentEndMs: number) {
  const span = Math.max(contentEndMs - contentStartMs, DAY_MS);
  const buffer = span * X_AXIS_BUFFER_RATIO;
  return {
    axisStartMs: contentStartMs - buffer,
    axisEndMs: contentEndMs + buffer,
  };
}

function buildChartGeometry(
  points: PriceHistoryPoint[],
  width: number,
  height: number,
  pad: { top: number; right: number; bottom: number; left: number },
  axisStartMs: number,
  axisEndMs: number,
  contentStartMs: number,
  contentEndMs: number,
  extraPrices: number[] = [],
) {
  const prices = [...points.map((p) => p.price), ...extraPrices];
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const span = Math.max(maxP - minP, 1);
  const yMin = minP - span * 0.12;
  const yMax = maxP + span * 0.12;

  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const axisSpanMs = Math.max(axisEndMs - axisStartMs, 1);
  const contentSpanMs = Math.max(contentEndMs - contentStartMs, 1);

  const projectMs = (ms: number, price: number) => {
    const ratio = (ms - axisStartMs) / axisSpanMs;
    const x = pad.left + Math.min(1, Math.max(0, ratio)) * plotW;
    const y = pad.top + (1 - (price - yMin) / (yMax - yMin)) * plotH;
    return { x, y };
  };

  const project = (date: string, price: number) => {
    const t = parsePointDateMs(date);
    return projectMs(Number.isFinite(t) ? t : axisStartMs, price);
  };

  const coords = points.map((p) => {
    const { x, y } = project(p.date, p.price);
    return { x, y, ...p };
  });

  // 시간순 정렬된 좌표로 곡선 (points는 보통 정렬되어 있지만 방어)
  const ordered = [...coords].sort((a, b) => parsePointDateMs(a.date) - parsePointDateMs(b.date));

  let d = '';
  if (ordered.length > 0) {
    d = `M ${ordered[0].x} ${ordered[0].y}`;
    for (let i = 0; i < ordered.length - 1; i++) {
      const p0 = ordered[i - 1] ?? ordered[i];
      const p1 = ordered[i];
      const p2 = ordered[i + 1];
      const p3 = ordered[i + 2] ?? p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
  }

  const yTicks = 5;
  const ticks = Array.from({ length: yTicks }, (_, i) => {
    const t = i / (yTicks - 1);
    const price = yMax - t * (yMax - yMin);
    const y = pad.top + t * plotH;
    return { price, y };
  });

  // X축 라벨은 콘텐츠 구간 기준. 오른쪽 끝은 항상 '오늘'
  const xLabelCount = 4;
  const withYear = contentSpanMs > 370 * DAY_MS;
  const xLabels = Array.from({ length: xLabelCount }, (_, i) => {
    const ratio = i / (xLabelCount - 1);
    const ms = contentStartMs + ratio * contentSpanMs;
    const isLast = i === xLabelCount - 1;
    return {
      x: pad.left + ((ms - axisStartMs) / axisSpanMs) * plotW,
      label: isLast ? '오늘' : formatAxisDateFromMs(ms, withYear),
    };
  });

  return {
    coords: ordered,
    d,
    ticks,
    xLabels,
    minP,
    maxP,
    pad,
    plotW,
    plotH,
    width,
    height,
    project,
  };
}

/**
 * 상세 핫딜가 추이 — 기간 탭 + 최저/지금/최고 + 라인 차트.
 */
export default function PriceHistorySection({
  productId,
  currentPrice: currentPriceProp,
  postedAt,
}: Props) {
  const [mounted, setMounted] = useState(false);
  /** null이면 데이터 기준 기본 기간 사용 */
  const [daysOverride, setDaysOverride] = useState<number | null>(null);
  const gradId = useId().replace(/:/g, '');
  // 선택 기간 X축은 항상 '오늘'이 오른쪽 끝
  const nowMs = useMemo(() => Date.now(), [productId, mounted]);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setDaysOverride(null);
  }, [productId]);

  const { data, isLoading, isError, error } = useQuery({
    ...ProductQueries.priceHistory({ id: productId, days: MAX_DAYS }),
    enabled: mounted,
  });

  const history = data?.product?.priceHistory ?? null;
  const modelPage = data?.product?.modelPage ?? null;
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

  if (mounted && isError && process.env.NODE_ENV === 'development') {
    return (
      <section className="py-0">
        <DetailSectionHeader title="가격 추이" />
        <p className="mt-2 text-xs text-red-500">
          priceHistory 조회 실패: {error instanceof Error ? error.message : 'unknown'}
        </p>
      </section>
    );
  }

  if (!mounted) return null;

  if (isLoading) {
    return (
      <section className="py-0">
        <div className="h-7 w-28 animate-pulse rounded bg-gray-100" />
        <div className="mt-3 h-9 animate-pulse rounded-lg bg-gray-50" />
        <div className="mt-3 h-16 animate-pulse rounded-xl bg-gray-50" />
        <div className="mt-3 h-52 animate-pulse rounded-xl bg-gray-50" />
      </section>
    );
  }

  // 이 상품은 추이 데이터 없음 → 섹션 자체 숨김
  if (isError || !history || allPoints.length < 2) return null;
  if (points.length < 2) return null;

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
  const currentPriceBadge = resolveCurrentPriceBadge(currentPrice, minPrice, maxPrice, currency);
  // 축·문구: 선택한 기간만 (왼쪽=기간 시작, 오른쪽=오늘)
  const rangeFromLabel = toKstDateString(contentStartMs);
  const rangeToLabel = toKstDateString(contentEndMs);
  const visiblePeriods = periodStates.filter((p) => p.enabled);

  const subtitle = resolveSubtitle(history);

  // 유사(LOW) 추이에서는 모델 페이지로 보내지 않음 — 틀린 연결 방지.
  const showModelPageCta =
    !!modelPage?.slug && history.confidence === 'HIGH' && history.basis !== 'SIMILAR';

  return (
    <section className="py-0">
      <DetailSectionHeader title="가격 추이" subtitle={subtitle} />

      {visiblePeriods.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {visiblePeriods.map((p) => {
            const active = days === p.days;
            return (
              <button
                key={p.days}
                type="button"
                onClick={() => setDaysOverride(p.days)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                  active
                    ? 'border-gray-900 bg-gray-900 font-semibold text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-2 text-xs text-gray-400">
        이 기간 핫딜 {points.length}건{` · ${formatRangeLabel(rangeFromLabel, rangeToLabel)}`}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-gray-50 px-4 py-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-500">최저</span>
          <span className="text-error-500 text-sm font-bold sm:text-base">
            {won(minPrice, currency)}
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs text-gray-500">현재가</span>
          <span className="text-sm font-bold text-gray-900 sm:text-base">
            {won(currentPrice, currency)}
          </span>
          {currentPriceBadge ? (
            <span className="text-[11px] font-medium text-emerald-600">
              {currentPriceBadge.text}
            </span>
          ) : null}
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
      />

      {showModelPageCta && modelPage ? <ModelPageCta modelPage={modelPage} /> : null}
    </section>
  );
}

function ModelPageCta({ modelPage }: { modelPage: ProductModelPageLink }) {
  const meta = [
    modelPage.brand?.trim() || null,
    modelPage.dealCount > 0 ? `최근 핫딜 ${modelPage.dealCount}건` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link
      href={`/deals/${modelPage.slug}`}
      data-track="model-page-cta"
      data-source="price_history"
      data-slug={modelPage.slug}
      className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3.5 transition-colors hover:border-gray-300 hover:bg-gray-50"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">
          {modelPage.modelName} 핫딜 모음 보기
        </p>
        {meta ? <p className="mt-0.5 truncate text-xs text-gray-500">{meta}</p> : null}
      </div>
      <span className="shrink-0 text-sm text-gray-400" aria-hidden>
        →
      </span>
    </Link>
  );
}

/** 라인/점은 동일 블루, 현재 상품만 채운 점으로 구분 */
const CHART = {
  line: '#3B82F6',
  current: '#467DFB',
  guide: '#93C5FD',
  currentGuide: '#91B1FB',
  low: '#EF4444',
  high: '#2563EB',
} as const;

function PriceLineChart({
  points,
  currentMarker,
  currency,
  minPrice,
  maxPrice,
  gradId,
  axisStartMs,
  axisEndMs,
  contentStartMs,
  contentEndMs,
}: {
  points: PriceHistoryPoint[];
  currentMarker: CurrentProductMarker | null;
  currency: string;
  minPrice: number;
  maxPrice: number;
  gradId: string;
  axisStartMs: number;
  axisEndMs: number;
  contentStartMs: number;
  contentEndMs: number;
}) {
  const width = 640;
  const height = 260;
  const pad = { top: 40, right: 20, bottom: 28, left: 44 };
  const svgRef = useRef<SVGSVGElement>(null);

  // hover: 가이드만 / click: 아래 카드 고정
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [selectedSeed, setSelectedSeed] = useState(true);

  const geo = useMemo(
    () =>
      buildChartGeometry(
        points,
        width,
        height,
        pad,
        axisStartMs,
        axisEndMs,
        contentStartMs,
        contentEndMs,
        currentMarker ? [currentMarker.price] : [],
      ),
    [points, width, height, axisStartMs, axisEndMs, contentStartMs, contentEndMs, currentMarker],
  );

  const orderedPoints = geo.coords;
  const seedCoord = useMemo(() => {
    if (!currentMarker) return null;
    const { x, y } = geo.project(currentMarker.date, currentMarker.price);
    return { ...currentMarker, x, y };
  }, [currentMarker, geo]);

  const defaultIdx = Math.max(0, orderedPoints.length - 1);
  const resolvedSelectedIdx = selectedIdx ?? defaultIdx;

  const viewingCurrent = selectedSeed || !currentMarker;
  const selectedPoint: PriceHistoryPoint | null =
    viewingCurrent && currentMarker
      ? {
          date: currentMarker.date,
          price: currentMarker.price,
          deal: currentMarker.deal,
          deals: [currentMarker.deal],
        }
      : (orderedPoints[resolvedSelectedIdx] ?? null);

  const clientXToPlotX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * width;
  };

  const nearestIdxFromClientX = (clientX: number) => {
    if (orderedPoints.length === 0) return defaultIdx;
    const x = clientXToPlotX(clientX);
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < orderedPoints.length; i++) {
      const dist = Math.abs(orderedPoints[i].x - x);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  };

  const selectAtClientX = (clientX: number) => {
    const x = clientXToPlotX(clientX);
    const idx = nearestIdxFromClientX(clientX);
    const pointDist = orderedPoints[idx] != null ? Math.abs(orderedPoints[idx].x - x) : Infinity;
    const seedDist = seedCoord ? Math.abs(seedCoord.x - x) : Infinity;
    if (seedCoord && seedDist <= pointDist) {
      setSelectedSeed(true);
      return;
    }
    setSelectedSeed(false);
    setSelectedIdx(idx);
  };

  const selectedCoord =
    !viewingCurrent && orderedPoints[resolvedSelectedIdx]
      ? orderedPoints[resolvedSelectedIdx]
      : null;

  return (
    <div className="mt-4 w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full cursor-pointer touch-pan-y"
        role="img"
        aria-label="가격 추이 그래프"
        onMouseMove={(e) => setHoverIdx(nearestIdxFromClientX(e.clientX))}
        onMouseLeave={() => setHoverIdx(null)}
        onClick={(e) => selectAtClientX(e.clientX)}
      >
        <defs>
          <linearGradient id={`fill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.line} stopOpacity="0.16" />
            <stop offset="100%" stopColor={CHART.line} stopOpacity="0" />
          </linearGradient>
        </defs>

        {geo.ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={t.y}
              y2={t.y}
              stroke="#E5E7EB"
              strokeWidth={1}
            />
            <text
              x={pad.left - 8}
              y={t.y + 3}
              textAnchor="end"
              className="fill-gray-400"
              fontSize={10}
            >
              {shortWon(t.price, currency)}
            </text>
          </g>
        ))}

        {/* 가이드는 하나만: 호버 중이면 호버, 아니면 선택/현재 */}
        {(() => {
          const guide =
            hoverIdx != null && orderedPoints[hoverIdx]
              ? { x: orderedPoints[hoverIdx].x, color: CHART.guide, dash: false }
              : selectedCoord
                ? { x: selectedCoord.x, color: CHART.guide, dash: false }
                : seedCoord
                  ? { x: seedCoord.x, color: CHART.currentGuide, dash: true }
                  : null;
          if (!guide) return null;
          return (
            <line
              x1={guide.x}
              x2={guide.x}
              y1={pad.top}
              y2={height - pad.bottom}
              stroke={guide.color}
              strokeWidth={1.5}
              strokeDasharray={guide.dash ? '4 3' : undefined}
            />
          );
        })()}

        {geo.d && orderedPoints.length > 0 && (
          <path
            d={`${geo.d} L ${orderedPoints[orderedPoints.length - 1].x} ${height - pad.bottom} L ${orderedPoints[0].x} ${height - pad.bottom} Z`}
            fill={`url(#fill-${gradId})`}
          />
        )}

        <path d={geo.d} fill="none" stroke={CHART.line} strokeWidth={2.5} strokeLinejoin="round" />

        {orderedPoints.map((c, i) => {
          // seed는 아래 전용 마커로만 그림 (이중 점 방지)
          if (currentMarker && isSeedDeal(c.deal, currentMarker.deal.id)) return null;

          const isLow = c.price === minPrice;
          const isHigh = c.price === maxPrice && maxPrice !== minPrice;
          const isHovered = i === hoverIdx;
          const isSelected = Boolean(selectedCoord && i === resolvedSelectedIdx);
          // 라벨은 최저/최고 + 호버/선택만 (기본 전부 숨김)
          const showPrice = isLow || isHigh || isHovered || isSelected;
          const stroke = isLow ? CHART.low : CHART.line;
          const labelFill = isLow ? CHART.low : isHigh ? CHART.high : '#6B7280';

          return (
            <g key={`${c.date}-${i}`}>
              {showPrice && (
                <text
                  x={c.x}
                  y={c.y - 12}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={isLow || isHigh ? 700 : 500}
                  fill={labelFill}
                >
                  {won(c.price, currency)}
                </text>
              )}
              <circle
                cx={c.x}
                cy={c.y}
                r={isSelected || isHovered ? 5.5 : 4}
                fill="#fff"
                stroke={stroke}
                strokeWidth={isSelected || isHovered ? 2.5 : 2}
              />
            </g>
          );
        })}

        {/* 이 상품 — 채운 점 + 라벨 (한눈에 위치 파악) */}
        {seedCoord && (
          <g>
            <text
              x={seedCoord.x}
              y={Math.max(pad.top - 6, seedCoord.y - 28)}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill={CHART.current}
            >
              이 상품
            </text>
            <text
              x={seedCoord.x}
              y={Math.max(pad.top + 6, seedCoord.y - 14)}
              textAnchor="middle"
              fontSize={10}
              fontWeight={600}
              fill={CHART.current}
            >
              {won(seedCoord.price, currency)}
            </text>
            <circle
              cx={seedCoord.x}
              cy={seedCoord.y}
              r={6.5}
              fill={CHART.current}
              stroke="#fff"
              strokeWidth={2}
            />
          </g>
        )}

        {geo.xLabels.map((label, i) => {
          const isToday = i === geo.xLabels.length - 1;
          return (
            <text
              key={i}
              x={label.x}
              y={height - 8}
              textAnchor={i === 0 ? 'start' : isToday ? 'end' : 'middle'}
              fontSize={10}
              fontWeight={isToday ? 600 : 400}
              className={isToday ? 'fill-gray-600' : 'fill-gray-400'}
            >
              {label.label}
            </text>
          );
        })}
      </svg>

      {selectedPoint && (
        <DealPreview point={selectedPoint} currency={currency} isCurrent={viewingCurrent} />
      )}
    </div>
  );
}

function DealPreview({
  point,
  currency,
  isCurrent,
}: {
  point: PriceHistoryPoint;
  currency: string;
  isCurrent: boolean;
}) {
  const deal = point.deal;

  return (
    <div className="mt-3 rounded-xl border border-gray-200 bg-white p-2.5">
      <div className="mb-1.5 flex h-4 items-center gap-2 text-[11px] text-gray-400">
        {isCurrent ? (
          <span
            className="inline-block size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: CHART.current }}
          />
        ) : (
          <span className="inline-block size-1.5 shrink-0 opacity-0" aria-hidden />
        )}
        <span className="truncate">
          {formatAxisDate(point.date, true)}
          {isCurrent ? ' · 이 상품' : ''}
        </span>
      </div>
      <Link
        href={`/products/${deal.id}`}
        data-track="product-card"
        data-source="price_history"
        data-product-id={deal.id}
        className="flex items-center gap-2.5 hover:opacity-90"
      >
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-gray-50">
          {deal.thumbnail ? (
            <Image src={deal.thumbnail} alt="" fill sizes="44px" className="object-contain" />
          ) : (
            <div className="h-full w-full bg-gray-100" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs text-gray-900">{dealTitle(deal)}</div>
          {deal.providerName && (
            <div className="mt-0.5 truncate text-[11px] text-gray-400">{deal.providerName}</div>
          )}
        </div>
        <span className="text-error-500 shrink-0 text-xs font-semibold tabular-nums">
          {won(deal.parsedPrice, deal.priceCurrency ?? currency)}
        </span>
      </Link>
    </div>
  );
}
