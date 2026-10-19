import type {
  PriceHistoryDeal,
  PriceHistoryPoint,
  ProductPriceHistory,
} from '@/shared/api/product/product.service';

import { monotonePath, niceTicks } from './price-chart';

/** API는 최대 구간 한 번만 받고, 탭은 FE에서 자른다 */
export const MAX_DAYS = 730;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 기본 노출 기간 — 3개월 */
const DEFAULT_PERIOD_DAYS = 90;
/** 기본 탭 점 수가 이보다 적으면 더 긴 기간으로 확장 */
const MIN_DEFAULT_POINTS = 5;
/** 차트 X축 좌우 여백 (콘텐츠 구간 대비) */
const X_AXIS_BUFFER_RATIO = 0.08;
/**
 * Y축 최소 스팬 — 가격대의 15%.
 * 실제 변동폭이 이보다 작으면 축을 15%로 벌려 소폭 변동이 폭락처럼 안 보이게 한다.
 * ponytail: 고정 비율. 카테고리별(고가 가전 vs 생활용품) 튜닝이 필요하면 그때 분기.
 */
const MIN_Y_SPAN_RATIO = 0.15;

const PERIODS = [
  { label: '1개월', days: 30 },
  { label: '3개월', days: 90 },
  { label: '6개월', days: 180 },
  { label: '12개월', days: 365 },
  { label: '24개월', days: 730 },
] as const;

export function won(price: number, currency?: string | null): string {
  if (currency === 'USD') return `$${Math.round(price).toLocaleString()}`;
  return `${Math.round(price).toLocaleString()}원`;
}

export function formatAxisDate(date: string, withYear = false): string {
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

export function formatRangeLabel(from: string, to: string): string {
  const crossYear = from.slice(0, 4) !== to.slice(0, 4);
  return `${formatAxisDate(from, crossYear)} ~ ${formatAxisDate(to, crossYear)}`;
}

export function parsePointDateMs(date: string): number {
  // YYYY-MM-DD → local midnight
  const parts = date.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return NaN;
  return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
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

/** 점 필터용 — 선택 기간의 왼쪽 경계(오늘 기준) */
export function resolvePeriodStartMs(nowMs: number, days: number): number {
  return nowMs - days * DAY_MS;
}

/**
 * 차트 콘텐츠 구간 = 선택한 기간만.
 * (과거 seed 때문에 축을 늘리지 않음 — 3개월 탭이면 최근 3개월만)
 */
export function resolveContentRangeMs(
  nowMs: number,
  days: number,
): { contentStartMs: number; contentEndMs: number } {
  return {
    contentStartMs: resolvePeriodStartMs(nowMs, days),
    contentEndMs: nowMs,
  };
}

/** 점이 축 끝에 붙지 않도록 콘텐츠 구간 양옆에 버퍼 */
export function withAxisBuffer(contentStartMs: number, contentEndMs: number) {
  const span = Math.max(contentEndMs - contentStartMs, DAY_MS);
  const buffer = span * X_AXIS_BUFFER_RATIO;
  return {
    axisStartMs: contentStartMs - buffer,
    axisEndMs: contentEndMs + buffer,
  };
}

export function buildChartGeometry(
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
  // 변동폭이 가격대의 MIN_Y_SPAN_RATIO 미만이면 축을 그만큼 넓혀 완만하게 보이게 한다.
  // (9600→9800 같은 2% 변동이 화면 전체를 쓰며 폭락처럼 보이는 것 방지)
  const mid = (minP + maxP) / 2;
  const span = Math.max(maxP - minP, mid * MIN_Y_SPAN_RATIO, 1);
  // 가격은 음수가 될 수 없다. 변동폭이 큰 상품(예: 3,000~32,960원)에서 아래 여백이
  // 0을 파고들어 축에 '-1k'가 찍히던 것 방지 — 잘린 만큼 위로 넘기지 않고 0에서 멈춘다.
  const yMin = Math.max(0, mid - span / 2 - span * 0.12);
  const yMax = mid + span / 2 + span * 0.12;

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

  const d = monotonePath(ordered);

  const nice = niceTicks(yMin, yMax);
  const tickStep = nice.step;
  const ticks = nice.prices.map((price) => ({
    price,
    y: pad.top + (1 - (price - yMin) / (yMax - yMin)) * plotH,
  }));

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
    tickStep,
    yMax,
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
