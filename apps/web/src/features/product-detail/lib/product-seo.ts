/** 상품 상세 SEO 문구. 메타·JSON-LD·RSS가 같은 규칙을 쓴다. */

export const META_DESCRIPTION_MAX = 220;

export const MISSING_PRODUCT_METADATA = {
  title: '상품을 찾을 수 없습니다 | 지름알림',
  description: '요청하신 핫딜 상품을 찾을 수 없습니다.',
  robots: { index: false, follow: false },
  openGraph: {
    title: '상품을 찾을 수 없습니다 | 지름알림',
    description: '요청하신 핫딜 상품을 찾을 수 없습니다.',
  },
} as const;

export type PriceHistorySeoSummary = {
  minPrice: number;
  maxPrice: number;
  rangeDays: number;
  pointCount: number;
  confidence: 'HIGH' | 'LOW';
};

export function parseNumericPrice(rawPrice?: string | null) {
  if (!rawPrice) {
    return null;
  }

  const normalized = rawPrice.replace(/[^0-9]/g, '');

  if (!normalized) {
    return null;
  }

  const numericValue = Number(normalized);

  return Number.isNaN(numericValue) ? null : numericValue;
}

export function summarizePriceHistoryForSeo(
  history:
    | {
        points?: Array<{ price: number }> | null;
        rangeDays: number;
        confidence: 'HIGH' | 'LOW';
      }
    | null
    | undefined,
): PriceHistorySeoSummary | null {
  const points = history?.points;
  if (!history || !points || points.length < 2) return null;

  const prices = points.map((p) => p.price).filter((p) => Number.isFinite(p) && p > 0);
  if (prices.length < 2) return null;

  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    rangeDays: history.rangeDays,
    pointCount: points.length,
    confidence: history.confidence,
  };
}

export function formatPriceHistorySeoText(summary: PriceHistorySeoSummary): string {
  const periodLabel =
    summary.rangeDays >= 360
      ? `${Math.round(summary.rangeDays / 365)}년`
      : `${Math.max(1, Math.round(summary.rangeDays / 30))}개월`;
  const min = summary.minPrice.toLocaleString('ko-KR');
  const max = summary.maxPrice.toLocaleString('ko-KR');

  if (summary.confidence === 'LOW') {
    return `최근 ${periodLabel} 유사 핫딜가 ${min}~${max}원`;
  }
  return `최근 ${periodLabel} 핫딜 최저가 ${min}원 · 최고가 ${max}원`;
}

/** 핫딜 가격을 "아직 유효하다"고 주장할 수 있는 기간. 커뮤니티 핫딜 수명은 며칠 단위다. */
export const OFFER_VALID_DAYS = 7;
/** 이 일수를 넘긴 딜은 재고 상태를 아예 주장하지 않는다. */
export const STALE_AFTER_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export type OfferFreshness = {
  /** schema.org Offer.availability. undefined = 주장하지 않음(필드 생략). */
  availability?: string;
  /** schema.org Offer.priceValidUntil (YYYY-MM-DD). */
  priceValidUntil?: string;
};

/**
 * 게시일로 Offer 의 재고·가격 유효기간을 정한다.
 *
 * 왜 필요한가: 종료 경로가 사용자 제보와 제목 "종료/품절" 둘뿐이라 시간이 지나도 `isEnd` 가
 * 안 켜진다(2026-09-02 실측: 1년 이상 지난 딜 60건 중 `isEnd=true` 0건). 그래서 2024년 딜도
 * `InStock` + 옛 가격으로 나가고, AI 가 그걸 "지금 가격"으로 인용한다.
 *
 * 백엔드 자동 종료가 들어오기 전까지의 **완화**다 — 데이터를 고치는 게 아니라 주장을 줄인다.
 * - 종료 확정: Discontinued (가격 유효기간은 의미 없어 생략)
 * - 게시일 모름: 현행 유지(InStock) — 근거 없이 상태를 바꾸지 않는다
 * - 신선(≤30일): InStock + 게시일+7일까지 유효
 * - 오래됨(>30일): **availability 생략** + 과거 날짜 priceValidUntil
 *   → OutOfStock 으로 단정하지 않는다(팔릴 수도 있다). 없는 주장이 틀린 주장보다 낫다.
 */
export function buildOfferFreshness(
  postedAt?: string | Date | null,
  isEnd?: boolean | null,
  now: number = Date.now(),
): OfferFreshness {
  if (isEnd) {
    return { availability: 'https://schema.org/Discontinued' };
  }

  const posted = postedAt ? new Date(postedAt) : null;
  if (!posted || Number.isNaN(posted.getTime())) {
    return { availability: 'https://schema.org/InStock' };
  }

  const priceValidUntil = new Date(posted.getTime() + OFFER_VALID_DAYS * DAY_MS)
    .toISOString()
    .slice(0, 10);
  const ageDays = (now - posted.getTime()) / DAY_MS;

  if (ageDays > STALE_AFTER_DAYS) {
    return { priceValidUntil };
  }

  return { availability: 'https://schema.org/InStock', priceValidUntil };
}

/**
 * 오래된 딜에 붙는 본문 안내 문구. `buildOfferFreshness` 와 **같은 임계**를 써서
 * 구조화 데이터(availability 생략)와 화면이 같은 말을 하게 한다.
 *
 * 종료 확정 상품은 이미 "판매종료" 배지가 있으므로 중복하지 않는다.
 */
export function formatDealAgeNotice(
  postedAt?: string | Date | null,
  isEnd?: boolean | null,
  now: number = Date.now(),
): string | null {
  if (isEnd) return null;

  const posted = postedAt ? new Date(postedAt) : null;
  if (!posted || Number.isNaN(posted.getTime())) return null;

  const ageDays = (now - posted.getTime()) / DAY_MS;
  if (ageDays <= STALE_AFTER_DAYS) return null;

  const label =
    ageDays >= 365
      ? `${Math.floor(ageDays / 365)}년 전`
      : `${Math.max(1, Math.floor(ageDays / 30))}개월 전`;

  return `${label}에 올라온 핫딜이에요. 가격·재고가 지금과 다를 수 있어요.`;
}

export function clipMetaDescription(text: string, max: number = META_DESCRIPTION_MAX): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

/** 제목에 이미 가격이 적혀 있나 — "8,900원", "(8900/무료)", "89000원" 등 커뮤니티 원문 관행. */
export function hasPriceInTitle(title: string): boolean {
  return /[0-9][0-9,.]{2,}\s*원|\([0-9][0-9,]{2,}/.test(title);
}

/**
 * RSS 아이템 제목. 제목에 가격이 없을 때만 덧붙인다.
 * 커뮤니티 원문이 이미 "(600원)" 을 포함하는 경우가 많아, 무조건 붙이면
 * "Limbo (600원) (600원)" 처럼 중복된다(2026-09-02 운영 피드 실측).
 */
export function buildRssItemTitle(title: string, price?: string | null): string {
  if (!price?.trim() || hasPriceInTitle(title)) return title;
  return `${title} (${price})`;
}

/** 제목에 이미 구매 의도어가 있나. 네이버 실측상 의도어 검색의 CTR 이 2.9배 높다. */
function hasDealIntentWord(title: string): boolean {
  return /핫딜|최저가|특가|할인|쿠폰|무료|무배|파지|공구|이벤트/.test(title);
}

/**
 * 상품 상세 <title>.
 *
 * 가격이 있고 제목이 "그냥 상품명"일 때만 `최저가 N원 핫딜` 을 덧붙인다.
 * 근거(2026-09-01 네이버 서치어드바이저 report/expose 30일 실측):
 * 의도어 포함 검색어 CTR 17.1% vs 순수 상품명 5.9% — 2.9배. 전체 CTR 은 1.0%.
 * 표본 50개 중 56%가 "가격·의도어 둘 다 없는" 제목이라 여기가 개선 여지.
 *
 * ponytail: 이미 가격/의도어가 있으면 건드리지 않는다 — 중복 표기가 되레 지저분해지고,
 * 커뮤니티 원문 제목이 이미 "(2,550원/무료)" 형태를 자주 포함한다.
 */
export function buildProductSeoTitle(
  displayTitle: string,
  isEnd?: boolean | null,
  price?: number | null,
): string {
  const alreadyEnded = /판매종료/.test(displayTitle);
  const suffix = isEnd && !alreadyEnded ? ' (판매종료)' : '';

  const canAnnotate =
    !isEnd &&
    !alreadyEnded &&
    typeof price === 'number' &&
    Number.isFinite(price) &&
    price > 0 &&
    !hasPriceInTitle(displayTitle) &&
    !hasDealIntentWord(displayTitle);

  const dealHint = canAnnotate ? ` 최저가 ${price.toLocaleString('ko-KR')}원 핫딜` : '';

  return `${displayTitle}${suffix}${dealHint} | 지름알림`;
}

type GuideInput =
  | {
      productGuides?: Array<{ title: string; content: string }> | null;
    }
  | null
  | undefined;

export function generateDescription(
  productGuides: GuideInput,
  product: {
    title: string;
    categoryName?: string | null;
    price?: string | null;
    mallName?: string | null;
    provider?: { nameKr?: string | null } | null;
  },
  categoryName?: string,
  priceHistorySeo?: PriceHistorySeoSummary | null,
  commentSummary?: string | null,
): string {
  const historyText = priceHistorySeo ? formatPriceHistorySeoText(priceHistorySeo) : '';
  const mallName = product.mallName?.trim() || product.provider?.nameKr?.trim() || '';
  const numericPrice = parseNumericPrice(product.price);
  const priceText = numericPrice ? `${numericPrice.toLocaleString('ko-KR')}원` : '';
  const uniqueLead = commentSummary?.trim() || '';

  const guideParts =
    productGuides?.productGuides
      ?.filter((g) => g.title?.trim() && g.content?.trim())
      .map((g) => `${g.title.trim()}: ${g.content.trim().replace(/\s+/g, ' ')}`) ?? [];

  let rest = '';

  if (guideParts.length > 0) {
    const head = [
      mallName ? `쇼핑몰: ${mallName}` : '',
      guideParts.some((p) => p.startsWith('가격:')) ? '' : priceText ? `가격: ${priceText}` : '',
      ...guideParts,
    ].filter(Boolean);

    rest = historyText ? `${head.join(', ')} | ${historyText}` : head.join(', ');
  } else {
    const resolvedCategoryName = categoryName ?? product.categoryName ?? undefined;
    const categoryText = resolvedCategoryName ? `[${resolvedCategoryName}]` : '';

    const parts = [
      categoryText,
      product.title,
      priceText ? `현재가 ${priceText}` : '',
      historyText,
      mallName ? `구매처: ${mallName}` : '',
    ].filter(Boolean);

    rest =
      parts.length > 0
        ? `${parts.join(' | ')} | 지름알림에서 제공하는 초특가 핫딜 상품!`
        : `${product.title} | 지름알림에서 제공하는 초특가 핫딜 상품!`;
  }

  if (uniqueLead && rest) return `${uniqueLead} | ${rest}`;
  return uniqueLead || rest;
}

export function buildRssItemDescription(product: {
  title: string;
  price?: string | null;
  category?: string | null;
  mallName?: string | null;
  provider?: { nameKr?: string | null } | null;
}): string {
  const mall = product.mallName?.trim() || product.provider?.nameKr?.trim() || '';
  const parts = [
    product.category ? `${product.category} 핫딜` : '핫딜',
    product.title,
    product.price ? `현재가 ${product.price}` : '',
    mall ? `구매처 ${mall}` : '',
  ].filter(Boolean);
  return `${parts.join('. ')}. 지름알림에서 커뮤니티 핫딜을 모아 비교합니다.`;
}
