import {
  DAY_MS,
  DEFAULT_PERIOD_DAYS,
  MIN_DEFAULT_POINTS,
  parsePointDateMs,
  PERIODS,
} from '@jirum/domain/price-chart';

import type {
  PriceHistoryDeal,
  PriceHistoryPoint,
  ProductPriceHistory,
} from '@/shared/api/product/product.service';

// 축·곡선·눈금·기간 상수는 앱과 같은 @jirum/domain/price-chart 한 곳(2026-10-20 통합) — 여기선 web 화면용 나머지만.
export {
  buildChartGeometry,
  MAX_DAYS,
  parsePointDateMs,
  resolveContentRangeMs,
  resolvePeriodStartMs,
  withAxisBuffer,
  won,
} from '@jirum/domain/price-chart';

export function formatAxisDate(date: string, withYear = false): string {
  const parts = date.split('-');
  if (parts.length !== 3) return date;
  const md = `${parts[1]}.${parts[2]}`;
  return withYear ? `${parts[0].slice(2)}.${md}` : md;
}

export function formatRangeLabel(from: string, to: string): string {
  const crossYear = from.slice(0, 4) !== to.slice(0, 4);
  return `${formatAxisDate(from, crossYear)} ~ ${formatAxisDate(to, crossYear)}`;
}

export function dealTitle(deal: PriceHistoryDeal): string {
  return deal.displayTitle || deal.title || `상품 #${deal.id}`;
}

export function resolveSubtitle(
  history: Pick<ProductPriceHistory, 'basis' | 'confidence'>,
): string {
  if (history.basis === 'SIMILAR') {
    return '비슷한 상품 핫딜을 모아 참고용으로 보여드려요';
  }
  if (history.basis === 'SELF') {
    return '이 상품의 날짜별 가격을 보여드려요';
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

export function isSeedDeal(deal: PriceHistoryDeal, productId: number): boolean {
  return deal.isSeed || sameProductId(deal.id, productId);
}

/**
 * 가격 추이 아래 미리보기 카드를 링크로 그릴지. 「이 상품」(또는 고른 점이 지금 보는 딜)이면 링크가 지금 페이지라
 * 눌러도 아무 일이 없다 — Clarity dead click 1위(2026-10-20). 그땐 링크가 아닌 카드로 그린다(앱 DealPreview 와 같다).
 */
export function isPreviewLinkable(
  viewingCurrent: boolean,
  deal: PriceHistoryDeal,
  productId: number,
): boolean {
  return !viewingCurrent && !isSeedDeal(deal, productId);
}

export function toKstDateString(ms: number): string {
  // en-CA → YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(ms));
}

export type CurrentProductMarker = {
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
export function resolveCurrentProductMarker(
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

export function filterPointsByRange(
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
export function resolveSeedMs(
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

export type PeriodState = {
  label: string;
  days: number;
  enabled: boolean;
  points: PriceHistoryPoint[];
};

/**
 * 점이 2개 미만이거나, 더 짧은 기간과 점이 동일하면(빈 칸만 늘어남) 비활성.
 */
export function computePeriodStates(allPoints: PriceHistoryPoint[], nowMs: number): PeriodState[] {
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
export function pickDefaultDays(
  states: PeriodState[],
  seedMs: number | null,
  nowMs: number,
): number {
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
