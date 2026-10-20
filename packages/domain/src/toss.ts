/**
 * 토스 특가 코너 — 섹션→서버 키워드, 홈에 띄우는 탭, 상품 → 카드 모양 변환, 제목의 가격 떼기. web·앱이 같이 쓴다.
 *
 * 전엔 web(widgets/toss·entities/product/lib/from-toss)과 앱(entities/home/lib/toss)이 같은 코드를 따로 들고,
 * 앱 테스트가 web 파일을 읽어 키워드 표·탭 목록을 대조했다(home-sdui). 이제 정본은 여기다(2026-10-20).
 */

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
 * 홈 토스 섹션에 노출하는 탭. 공식 Open API 피드만(today-deals / best-selling / best-categories).
 * rising·creator·lowest·conversion 은 비공식 크롤이라 홈에서는 빼 둔다.
 */
export const TOSS_HOME_SECTION_IDS = ['daily', 'best', 'category'] as const;

/** 섹션 id 의 서버 키워드(모르는 id 면 전체). */
export const tossSectionKeyword = (section?: string): string =>
  TOSS_SECTION_KEYWORD[section ?? 'all'] ?? '토스';

export interface TossDeal {
  id: string;
  productId: number;
  title: string;
  /** 판매가(원) */
  price: number;
  image?: string;
  /** 41 => 「41% 특가」 */
  discountRate?: number;
  lowestIn30Days?: boolean;
  /** 「내일출발」·「내일도착」 */
  delivery?: string;
  rating?: number;
  reviewCount?: number;
  bestSeller?: boolean;
  arrivalGuaranteed?: boolean;
  lowestPriceCompensation?: boolean;
  specialProduct?: boolean;
  /** 「역대급특가」 같은 마케팅 라벨 */
  badge?: string;
  /** 「1개당 8,148원」 */
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
  unitPrice?: string | { unitName?: string; unitAmount?: number; unitPrice?: number };
  badge?: string;
}

/**
 * unitPrice 를 항상 문자열로. 서버가 문자열(「100g당 2,092원」) 또는 객체({unitName,unitAmount,unitPrice})로 준다 —
 * 객체를 그대로 화면에 넣으면 web 은 React #31 로 홈 전체가, 앱은 Text 가 죽었다.
 */
function normalizeUnitPrice(u: TossExt['unitPrice']): string | undefined {
  if (typeof u === 'string') return u;
  if (u && typeof u === 'object' && u.unitPrice != null && u.unitName) {
    return `${u.unitAmount ?? 1}${u.unitName}당 ${u.unitPrice.toLocaleString()}원`;
  }
  return undefined;
}

/** 상품의 `data.toss` 확장정보를 카드가 쓸 모양으로. salePrice 가 없으면 price 문자열에서 숫자를 뽑는다. */
export function toTossDeal(p: {
  id: string;
  title: string;
  price?: string | null;
  thumbnail?: string | null;
  data?: unknown;
}): TossDeal {
  const t = ((p.data as { toss?: TossExt } | null)?.toss ?? {}) as TossExt;
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

/** 토스 특가 코너 → 상세. referrer 는 앱·인앱웹뷰에서 비는 경우가 많아 쿼리로 경로를 명시한다. */
export const tossDetailPath = (productId: number): string => `/products/${productId}?from=toss`;

/** productGuides 중 판매가 행. 토스 코너 유입 상세에서 숨긴다. */
export function isPriceGuideTitle(title: string): boolean {
  return /가격|할인가|판매가|정가/.test(title);
}

/**
 * 토스 소싱 제목에 붙는 판매가(「23,800원」)·단위가(「100g당 2,092원」)를 뗀다.
 * 「원피스」처럼 원 이 글자인 경우는 숫자가 없어 건드리지 않는다.
 */
export function stripPriceFromTitle(title: string): string {
  return title
    .replace(/\s*\d+(?:g|ml|kg|l|개|매|롤|포|장|입)?당\s*\d{1,3}(?:,\d{3})*원/gi, '')
    .replace(/\s*\d{1,3}(?:,\d{3})+원/g, '')
    .replace(/\s*\d{4,}원/g, '')
    .replace(/\s+\d{1,3}원(?=\s|$)/g, '')
    .replace(/[\s,·|/]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
