/**
 * 뷰티 목록 조회 — 쿼리 문자열·변수·응답 다듬기. 서버(server.ts)·브라우저(client.ts) 둘 다 이걸 쓴다.
 * import 없이 자족한다 — products.test.ts 가 맨 node 로 돈다.
 *
 * 쿼리는 apps/web shared/api/product/product.service.ts 의 QueryProducts, app/(desktop-ready)/toss 의
 * QueryTossProducts 에서 이 화면이 쓰는 필드만 옮겼다(codegen 없이 손타입 — web 도 mallName 등은 손으로 보강한다).
 */

export type HotDealType = 'HOT_DEAL' | 'SUPER_DEAL' | 'ULTRA_DEAL';

export interface BeautyProduct {
  id: string;
  title: string;
  price?: string | null;
  thumbnail?: string | null;
  isEnd?: boolean | null;
  hotDealType?: HotDealType | null;
  /** 판매처(쇼핑몰). 없을 수 있다. */
  mallName?: string | null;
  /** 제보 커뮤니티. */
  provider?: { nameKr?: string | null } | null;
  postedAt: string;
  /** 다음 쪽 커서(랭킹·최신순 모두 searchAfter 로 이어진다). */
  searchAfter?: string[] | null;
}

export interface ProductPage {
  products: BeautyProduct[];
}

export const QUERY_PRODUCTS = `
  query BeautyProducts(
    $limit: Int!
    $searchAfter: [String!]
    $startDate: DateTime
    $orderBy: ProductOrderType
    $orderOption: OrderOptionType
    $categoryId: Int
    $isEnd: Boolean
  ) {
    products(
      limit: $limit
      searchAfter: $searchAfter
      startDate: $startDate
      orderBy: $orderBy
      orderOption: $orderOption
      categoryId: $categoryId
      isEnd: $isEnd
    ) {
      id
      title
      price
      thumbnail
      isEnd
      hotDealType
      mallName
      provider {
        nameKr
      }
      postedAt
      searchAfter
    }
  }
`;

export interface ProductListVariables {
  limit: number;
  searchAfter?: string[] | null;
  startDate?: string;
  orderBy: 'COMMUNITY_RANKING' | 'POSTED_AT';
  orderOption: 'DESC';
  categoryId: number;
  isEnd?: boolean;
}

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * KST 기준 n 일 전 자정(UTC ISO). web getDayBefore(`dayjs().tz('Asia/Seoul').add(-n,'day').startOf('day')`)와 같은 값.
 * 하루 동안 값이 같아야 서버 데이터 캐시(같은 요청 본문)가 맞는다.
 */
export function kstStartOfDayBefore(days: number, now: number = Date.now()): string {
  const kst = new Date(now + KST_OFFSET_MS);
  kst.setUTCHours(0, 0, 0, 0);
  return new Date(kst.getTime() - KST_OFFSET_MS - days * DAY_MS).toISOString();
}

/** 화장품은 딜이 드물어 랭킹을 60일까지 본다 — web·앱 정본 @jirum/domain/ranking 의 rankingWindowDays(3) 과 같은 값. */
const RANKING_WINDOW_DAYS = 60;

/**
 * 커뮤니티 반응 순 랭킹(진행 중인 딜만, 최근 60일) — web 랭킹 탭(화장품)·/beauty 랜딩과 같은 조건·순서.
 * 랭킹 순서도 searchAfter 로 이어진다(2026-10-14 운영 API 실측: 2쪽째가 1쪽 마지막 점수 아래로 중복 없이 이어짐).
 */
export function rankingVariables(
  categoryId: number,
  limit: number,
  now?: number,
): ProductListVariables {
  return {
    limit,
    orderBy: 'COMMUNITY_RANKING',
    startDate: kstStartOfDayBefore(RANKING_WINDOW_DAYS, now),
    categoryId,
    orderOption: 'DESC',
    isEnd: false,
  };
}

/** 최신순 — web 실시간 탭(useLiveViewModel)과 같은 조건에 카테고리만 고정. */
export function latestVariables(categoryId: number, limit: number): ProductListVariables {
  return { limit, orderBy: 'POSTED_AT', orderOption: 'DESC', categoryId };
}

/** 다음 쪽 커서. 한 쪽이 덜 찼으면 끝(web infiniteRankingProducts getNextPageParam 과 같은 규칙). */
export function nextCursor(page: BeautyProduct[], limit: number): string[] | null {
  if (page.length < limit) return null;
  return page.at(-1)?.searchAfter ?? null;
}

// ---------------------------------------------------------------- 토스

/**
 * 토스 카테고리 인기 피드. tossCategoryLabel 은 이 섹션(키워드 '토스_카테고리인기')에서만 걸린다 —
 * '토스'(전체)·'토스_하루특가' 에 '뷰티' 를 넘기면 무시되고 식품이 섞여 나온다(2026-10-14 운영 API 실측).
 */
export const TOSS_BEAUTY_KEYWORD = '토스_카테고리인기';
export const TOSS_BEAUTY_LABEL = '뷰티';

export const QUERY_TOSS_PRODUCTS = `
  query BeautyTossProducts(
    $limit: Int!
    $keyword: String!
    $orderBy: KeywordProductOrderType!
    $orderOption: OrderOptionType!
    $tossCategoryLabel: String
  ) {
    productsByKeyword(
      limit: $limit
      keyword: $keyword
      orderBy: $orderBy
      orderOption: $orderOption
      tossCategoryLabel: $tossCategoryLabel
    ) {
      id
      title
      thumbnail
      data
    }
  }
`;

export const tossBeautyVariables = (limit: number) => ({
  limit,
  keyword: TOSS_BEAUTY_KEYWORD,
  orderBy: 'POSTED_AT',
  orderOption: 'DESC',
  tossCategoryLabel: TOSS_BEAUTY_LABEL,
});

export interface TossProductRow {
  id: string;
  title: string;
  thumbnail?: string | null;
  data?: unknown;
}

/**
 * 토스 코너 카드. web /toss 코너처럼 **가격·할인율은 싣지 않는다**(코너 정책 — web TossDealCard 주석).
 */
export interface TossDeal {
  id: string;
  title: string;
  thumbnail?: string;
  badge?: string;
  bestSeller?: boolean;
  arrivalGuaranteed?: boolean;
  specialProduct?: boolean;
  rating?: number;
  reviewCount?: number;
}

interface TossExt {
  badge?: string;
  bestSeller?: boolean;
  arrivalGuaranteed?: boolean;
  specialProduct?: boolean;
  rating?: number;
  reviewCount?: number;
}

/**
 * 토스 소싱 제목에 붙는 판매가("23,800원")·단위가("100g당 2,092원")를 뗀다.
 * web entities/product/lib/from-toss.ts stripPriceFromTitle 복사.
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

export function toTossDeal(row: TossProductRow): TossDeal {
  const t = ((row.data as { toss?: TossExt } | null)?.toss ?? {}) as TossExt;
  return {
    id: row.id,
    title: stripPriceFromTitle(row.title),
    thumbnail: row.thumbnail ?? undefined,
    badge: t.badge,
    bestSeller: t.bestSeller,
    arrivalGuaranteed: t.arrivalGuaranteed,
    specialProduct: t.specialProduct,
    rating: typeof t.rating === 'number' ? t.rating : undefined,
    reviewCount: typeof t.reviewCount === 'number' ? t.reviewCount : undefined,
  };
}
