/**
 * 가격 추이 요약 문구·기본 기간. web `features/product-detail/ui/PriceHistorySection.tsx`
 * 의 resolveCurrentPriceBadge·resolveSubtitle·formatRangeLabel·pickDefaultDays 와 같은 규칙.
 * 같은 상품이 웹/앱에서 다른 문구를 내면 유저는 버그로 읽는다.
 */
import {
  DAY_MS,
  DEFAULT_PERIOD_DAYS,
  MIN_DEFAULT_POINTS,
  won,
} from './chart-geometry';

/** 절약 카피 최소액 — 이하면 'N원 절약'이 초라해져 숨김 */
const minSaveAmount = (currency?: string | null) =>
  currency === 'USD' ? 1 : 1000;
/** 가격대 상위 구간(비싼 편) — 절약 카피 숨김 */
const EXPENSIVE_RATIO = 0.7;

/**
 * 현재가 배지: 최저 대비(+)가 아니라 최고 대비 절약(−)으로 프레이밍.
 * 기간 최저 → 「기간 최저」, 비싼 구간·절약액 미미 → 숨김, 그 외 → 「최고 대비 N원 절약」.
 */
export function resolveCurrentPriceBadge(
  currentPrice: number,
  minPrice: number,
  maxPrice: number,
  currency?: string | null,
): string | null {
  if (currentPrice <= minPrice) return '기간 최저';
  if (maxPrice <= minPrice) return null;

  const ratio = (currentPrice - minPrice) / (maxPrice - minPrice);
  if (ratio > EXPENSIVE_RATIO) return null;

  const saveAmount = maxPrice - currentPrice;
  if (saveAmount < minSaveAmount(currency)) return null;

  return `최고 대비 ${won(saveAmount, currency)} 절약`;
}

export function resolveSubtitle(history: {
  basis?: string | null;
  confidence?: string | null;
}): string {
  if (history.basis === 'SIMILAR') {
    return '비슷한 상품 핫딜을 모아 참고용으로 보여드려요';
  }
  if (history.confidence === 'HIGH' && history.basis === 'MAPPING') {
    return '같은 모델의 커뮤니티 핫딜가를 모아 보여드려요';
  }
  return '같은 상품의 커뮤니티 핫딜가를 모아 보여드려요';
}

function formatAxisDate(date: string, withYear = false): string {
  const parts = date.split('-');
  if (parts.length !== 3) return date;
  const md = `${parts[1]}.${parts[2]}`;
  return withYear ? `${parts[0].slice(2)}.${md}` : md;
}

/** `YYYY-MM-DD` 두 개 → `MM.DD ~ MM.DD` (해가 바뀌면 `YY.MM.DD`). */
export function formatRangeLabel(from: string, to: string): string {
  const crossYear = from.slice(0, 4) !== to.slice(0, 4);
  return `${formatAxisDate(from, crossYear)} ~ ${formatAxisDate(
    to,
    crossYear,
  )}`;
}

/** 미리보기 카드의 날짜 라벨 — 항상 연도 포함(`YY.MM.DD`). */
export function formatPreviewDate(date: string): string {
  return formatAxisDate(date, true);
}

export type PeriodStateLike = {days: number; enabled: boolean; count: number};

/**
 * 기본 기간:
 * 1) 이 상품(seed) 게시 나이를 덮는 가장 짧은 활성 탭 (예: ~20개월 전 → 24개월)
 * 2) 없으면 활성 탭 중 가장 긴 것
 * 3) 그 탭 점이 MIN_DEFAULT_POINTS 미만이면 더 긴 활성 탭으로 확장
 */
export function pickDefaultDays(
  states: PeriodStateLike[],
  seedMs: number | null,
  nowMs: number,
): number {
  const enabled = states.filter(s => s.enabled).sort((a, b) => a.days - b.days);
  if (enabled.length === 0) return DEFAULT_PERIOD_DAYS;

  const ageDays =
    seedMs != null && Number.isFinite(seedMs)
      ? Math.max(0, (nowMs - seedMs) / DAY_MS)
      : 0;

  const covering = enabled.find(s => s.days + 1 >= ageDays);
  const preferred = covering?.days ?? enabled[enabled.length - 1].days;

  const fromPreferred = enabled.filter(s => s.days >= preferred);
  for (const s of fromPreferred) {
    if (s.count >= MIN_DEFAULT_POINTS) return s.days;
  }
  return fromPreferred[fromPreferred.length - 1]?.days ?? preferred;
}
