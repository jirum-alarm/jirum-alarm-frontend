/**
 * 가격 추이 차트의 '이 상품' 마커.
 * web PriceHistorySection 의 resolveCurrentProductMarker 와 같은 규칙 —
 * 라인(일별 최저)과 분리해서, 같은 날 더 싼 딜이 있어도 seed 실제가로 찍는다.
 * 과거 상품은 postedAt 날짜에 찍고 오늘로 합성하지 않는다.
 */

export type SeedDeal = {
  id: number;
  isSeed?: boolean | null;
  parsedPrice?: number | null;
};

export type HistoryPoint = {
  date: string;
  price: number;
  deal?: SeedDeal | null;
};

export type CurrentProductMarker = {
  date: string;
  price: number;
};

function sameProductId(a: number | string, b: number): boolean {
  return Number(a) === b;
}

export function isSeedDeal(
  deal: SeedDeal | null | undefined,
  productId: number,
) {
  if (!deal) return false;
  return !!deal.isSeed || sameProductId(deal.id, productId);
}

export function toKstDateString(ms: number): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(ms));
}

export function postedAtToKstDate(postedAt?: string | null): string | null {
  if (!postedAt) return null;
  const ms = Date.parse(postedAt);
  if (!Number.isFinite(ms)) return null;
  return toKstDateString(ms);
}

export function resolveCurrentProductMarker(
  points: HistoryPoint[],
  productId: number,
  currentPrice: number | null | undefined,
  postedAt?: string | null,
): CurrentProductMarker | null {
  for (const p of points) {
    if (isSeedDeal(p.deal, productId)) {
      const price =
        typeof p.deal?.parsedPrice === 'number' && p.deal.parsedPrice > 0
          ? p.deal.parsedPrice
          : p.price;
      return {date: p.date, price};
    }
  }

  if (typeof currentPrice === 'number' && currentPrice > 0) {
    const date = postedAtToKstDate(postedAt);
    if (!date) return null;
    return {date, price: currentPrice};
  }

  return null;
}
