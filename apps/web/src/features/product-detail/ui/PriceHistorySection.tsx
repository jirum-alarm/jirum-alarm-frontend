'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import type { PriceHistoryDeal, PriceHistoryPoint } from '@/shared/api/product/product.service';
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
 * 기본 기간: 이 상품(seed)이 보이도록 '그때~오늘'을 덮는 가장 짧은 탭.
 * seed가 없거나 이미 최근이면, 점 개수가 가장 많은 활성 기간.
 */
function pickDefaultDays(states: PeriodState[], nowMs: number, seedMs: number | null): number {
  const enabled = states.filter((s) => s.enabled);
  if (enabled.length === 0) return 90;

  if (seedMs != null && Number.isFinite(seedMs) && seedMs < nowMs) {
    const ageDays = Math.max(1, Math.ceil((nowMs - seedMs) / DAY_MS));
    const covering = enabled.filter((s) => s.days >= ageDays).sort((a, b) => a.days - b.days);
    if (covering.length > 0) return covering[0].days;
    // 24개월보다도 오래된 딜 → 가장 긴 탭 (축은 seed까지 별도 확장)
    return enabled[enabled.length - 1].days;
  }

  const maxCount = Math.max(...enabled.map((s) => s.points.length));
  return enabled.find((s) => s.points.length === maxCount)?.days ?? enabled[0].days;
}

/** X축 시작: 기본/커버 기간이면 seed(그때)까지 확장, 짧은 기간 수동 확대면 오늘 기준 유지 */
function resolveRangeStartMs(
  nowMs: number,
  days: number,
  seedMs: number | null,
  daysOverride: number | null,
): number {
  const nominalStart = nowMs - days * DAY_MS;
  if (seedMs == null || !Number.isFinite(seedMs)) return nominalStart;

  const ageDays = Math.max(1, Math.ceil((nowMs - seedMs) / DAY_MS));
  const coversSeed = daysOverride == null || days >= ageDays;
  return coversSeed ? Math.min(nominalStart, seedMs) : nominalStart;
}

function buildChartGeometry(
  points: PriceHistoryPoint[],
  width: number,
  height: number,
  pad: { top: number; right: number; bottom: number; left: number },
  rangeStartMs: number,
  rangeEndMs: number,
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
  const spanMs = Math.max(rangeEndMs - rangeStartMs, 1);

  const project = (date: string, price: number) => {
    const t = parsePointDateMs(date);
    const ratio = Number.isFinite(t) ? (t - rangeStartMs) / spanMs : 0;
    const x = pad.left + Math.min(1, Math.max(0, ratio)) * plotW;
    const y = pad.top + (1 - (price - yMin) / (yMax - yMin)) * plotH;
    return { x, y };
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

  // X축: 선택 기간 타임라인 기준 라벨 (점과 무관). 1년 넘으면 연도 포함
  const xLabelCount = 4;
  const withYear = spanMs > 370 * 24 * 60 * 60 * 1000;
  const xLabels = Array.from({ length: xLabelCount }, (_, i) => {
    const ratio = i / (xLabelCount - 1);
    const ms = rangeStartMs + ratio * spanMs;
    return {
      x: pad.left + ratio * plotW,
      label: formatAxisDateFromMs(ms, withYear),
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
  const allPoints = history?.points ?? [];

  const seedMs = useMemo(
    () => resolveSeedMs(postedAt, allPoints, productId),
    [postedAt, allPoints, productId],
  );

  const periodStates = useMemo(() => computePeriodStates(allPoints, nowMs), [allPoints, nowMs]);

  const defaultDays = useMemo(
    () => pickDefaultDays(periodStates, nowMs, seedMs),
    [periodStates, nowMs, seedMs],
  );
  const days = useMemo(() => {
    const preferred = daysOverride ?? defaultDays;
    if (periodStates.some((s) => s.days === preferred && s.enabled)) return preferred;
    return defaultDays;
  }, [daysOverride, defaultDays, periodStates]);

  const rangeEndMs = nowMs;
  const rangeStartMs = useMemo(
    () => resolveRangeStartMs(nowMs, days, seedMs, daysOverride),
    [nowMs, days, seedMs, daysOverride],
  );

  const points = useMemo(
    () => filterPointsByRange(allPoints, rangeStartMs, rangeEndMs),
    [allPoints, rangeStartMs, rangeEndMs],
  );

  // seed는 전체 점에서 찾음 (과거 상품이 오늘로 잘못 찍히는 것 방지)
  const currentMarker = useMemo(
    () => resolveCurrentProductMarker(allPoints, productId, currentPriceProp, postedAt),
    [allPoints, productId, currentPriceProp, postedAt],
  );

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
  if (isError || !history || allPoints.length < 2 || points.length < 2) return null;

  const currency = history.currency;
  const orderedForMeta = [...points].sort(
    (a, b) => parsePointDateMs(a.date) - parsePointDateMs(b.date),
  );
  const prices = [...points.map((p) => p.price), ...(currentMarker ? [currentMarker.price] : [])];
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice =
    currentMarker?.price ??
    (typeof currentPriceProp === 'number' && currentPriceProp > 0
      ? currentPriceProp
      : orderedForMeta[orderedForMeta.length - 1]?.price);
  const isPeriodLow = currentPrice <= minPrice;
  // 축·문구: 오른쪽=오늘, 왼쪽=선택 기간(과거 딜이면 그때까지 확장)
  const rangeFromLabel = toKstDateString(rangeStartMs);
  const rangeToLabel = toKstDateString(rangeEndMs);
  const visiblePeriods = periodStates.filter((p) => p.enabled);

  const subtitle =
    history.basis === 'SIMILAR'
      ? '비슷한 상품 핫딜을 모아 참고용으로 보여드려요'
      : '같은 상품의 커뮤니티 핫딜가를 모아 보여드려요';

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
          {isPeriodLow ? (
            <span className="text-[11px] font-medium text-emerald-600">기간 최저</span>
          ) : minPrice > 0 ? (
            <span className="text-[11px] text-gray-400">
              최저 대비 +{Math.round(((currentPrice - minPrice) / minPrice) * 100)}%
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
        rangeStartMs={rangeStartMs}
        rangeEndMs={rangeEndMs}
      />
    </section>
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
  rangeStartMs,
  rangeEndMs,
}: {
  points: PriceHistoryPoint[];
  currentMarker: CurrentProductMarker | null;
  currency: string;
  minPrice: number;
  maxPrice: number;
  gradId: string;
  rangeStartMs: number;
  rangeEndMs: number;
}) {
  const width = 640;
  const height = 248;
  const pad = { top: 28, right: 16, bottom: 28, left: 44 };
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
        rangeStartMs,
        rangeEndMs,
        currentMarker ? [currentMarker.price] : [],
      ),
    [points, width, height, rangeStartMs, rangeEndMs, currentMarker],
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

        {/* 이 상품 — 채운 점만 (링/문구 없음) */}
        {seedCoord && (
          <circle
            cx={seedCoord.x}
            cy={seedCoord.y}
            r={6}
            fill={CHART.current}
            stroke="#fff"
            strokeWidth={2}
          />
        )}

        {geo.xLabels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={height - 8}
            textAnchor={i === 0 ? 'start' : i === geo.xLabels.length - 1 ? 'end' : 'middle'}
            fontSize={10}
            className="fill-gray-400"
          >
            {label.label}
          </text>
        ))}
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
