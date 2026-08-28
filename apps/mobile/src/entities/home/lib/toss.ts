/**
 * 토스 딜 변환. web: app/(desktop-ready)/toss/toss.api.ts
 *
 * 상품의 `data.toss` 확장정보를 카드가 쓸 모양으로 정규화한다.
 */

export interface TossDeal {
  id: string;
  productId: number;
  title: string;
  price: number;
  image?: string;
  discountRate?: number;
  lowestIn30Days?: boolean;
  delivery?: string;
  rating?: number;
  reviewCount?: number;
  bestSeller?: boolean;
  arrivalGuaranteed?: boolean;
  lowestPriceCompensation?: boolean;
  specialProduct?: boolean;
  badge?: string;
  unitPrice?: string;
}

interface TossExt {
  section?: string;
  sellerName?: string;
  salePrice?: number;
  originalPrice?: number;
  discountRate?: number;
  lowestIn30Days?: boolean;
  delivery?: string;
  rating?: number;
  reviewCount?: number;
  bestSeller?: boolean;
  arrivalGuaranteed?: boolean;
  lowestPriceCompensation?: boolean;
  specialProduct?: boolean;
  unitPrice?:
    | string
    | {unitName?: string; unitAmount?: number; unitPrice?: number};
  badge?: string;
}

/** 섹션 id → 서버 keyword. 서버 ProductKeywordCollection 과 일치해야 한다. */
export const TOSS_SECTION_KEYWORD: Record<string, string> = {
  all: '토스',
  daily: '토스_하루특가',
  best: '토스_지금인기',
  rising: '토스_급상승',
  category: '토스_카테고리인기',
  creator: '토스_크리에이터',
  lowest: '토스_최저가',
  conversion: '토스_전환율',
};

/**
 * unitPrice 를 항상 문자열로 만든다.
 *
 * ★ 서버가 문자열("100g당 2,092원") 또는 객체({unitName,unitAmount,unitPrice})로 준다.
 * 객체를 그대로 Text 에 넣으면 크래시한다(web 에선 React #31 로 홈 전체가 죽었다).
 * 실측상 daily·creator·lowest 섹션에서 unitPrice 가 실제로 내려온다.
 */
function normalizeUnitPrice(u: TossExt['unitPrice']): string | undefined {
  if (typeof u === 'string') return u;
  if (u && typeof u === 'object' && u.unitPrice != null && u.unitName) {
    return `${u.unitAmount ?? 1}${
      u.unitName
    }당 ${u.unitPrice.toLocaleString()}원`;
  }
  return undefined;
}

export function toTossDeal(p: {
  id: string;
  title: string;
  price?: string | null;
  thumbnail?: string | null;
  data?: unknown;
}): TossDeal {
  const t = ((p.data as {toss?: TossExt} | null)?.toss ?? {}) as TossExt;
  const priceNum = Number((p.price ?? '').replace(/[^0-9]/g, '')) || 0;

  return {
    id: p.id,
    productId: Number(p.id),
    title: stripPriceFromTitle(p.title),
    price: t.salePrice ?? priceNum,
    image: p.thumbnail ?? undefined,
    discountRate: t.discountRate,
    lowestIn30Days: t.lowestIn30Days,
    delivery: t.delivery,
    rating: t.rating,
    reviewCount: t.reviewCount,
    bestSeller: t.bestSeller,
    arrivalGuaranteed: t.arrivalGuaranteed,
    lowestPriceCompensation: t.lowestPriceCompensation,
    specialProduct: t.specialProduct,
    badge: t.badge,
    unitPrice: normalizeUnitPrice(t.unitPrice),
  };
}

/** 토스 특가 코너 → 상세. referrer 대신 쿼리로 경로를 명시한다(web from-toss.ts). */
export function tossDetailPath(productId: number): string {
  return `/products/${productId}?from=toss`;
}

export function isFromTossPath(path: string): boolean {
  return /[?&]from=toss(?:&|$)/.test(path);
}

export function isPriceGuideTitle(title: string): boolean {
  return /가격|할인가|판매가|정가/.test(title);
}

/**
 * 토스 소싱 제목에 붙는 판매가("23,800원")·단위가("100g당 2,092원")를 뗀다.
 * "원피스"처럼 원 이 글자인 경우는 숫자가 없어 건드리지 않는다.
 * web: entities/product/lib/from-toss.ts 와 동일 규칙.
 */
export function stripPriceFromTitle(title: string): string {
  return title
    .replace(
      /\s*\d+(?:g|ml|kg|l|개|매|롤|포|장|입)?당\s*\d{1,3}(?:,\d{3})*원/gi,
      '',
    )
    .replace(/\s*\d{1,3}(?:,\d{3})+원/g, '')
    .replace(/\s*\d{4,}원/g, '')
    .replace(/\s+\d{1,3}원(?=\s|$)/g, '')
    .replace(/[\s,·|/]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
