export type Deal = {
  id: number;
  title: string;
  url: string | null;
  parsedPrice: number | null;
  priceCurrency: string | null;
  mallName: string | null;
  categoryName: string | null;
  postedAt: string | null;
  commentSummary: CommentSummary | null;
};

export type CommentSummary = {
  summary: string | null;
  satisfaction: string | null;
  price: string | null;
  option: string | null;
  purchaseMethod: string | null;
};

/** 시세 안에서 이 가격이 어디 있나. 수량 파싱이 필요 없다 — 같은 상품의 과거 딜만 본다. */
export type PricePosition = {
  price: number;
  /** 0(최저) ~ 1(최고) */
  percentile: number;
  min: number;
  max: number;
  median: number;
  sampleSize: number;
  verdict: 'cheap' | 'normal' | 'pricey';
};

/**
 * 답변은 세 상태뿐이다. 애매한 중간을 두지 않는다 —
 * 근거가 부족하면 ANSWERED 로 넘어가지 못하게 타입으로 막는다.
 */
export type AnswerState =
  | { kind: 'ANSWERED'; deals: Deal[]; position: PricePosition | null }
  | { kind: 'PARTIAL'; deals: Deal[]; reason: PartialReason }
  | { kind: 'REFUSED'; reason: RefusalReason };

export type PartialReason =
  /** 표본이 사분위를 낼 만큼 안 됨 */
  | { code: 'SMALL_SAMPLE'; sampleSize: number }
  /** 묶음딜/다품목이 섞여 단일 시세를 못 냄 — 실측 38% */
  | { code: 'MIXED_BUNDLE'; bundleCount: number; total: number }
  /** 한글 부분문자열 오염 — 콜라→콜라겐 등 */
  | { code: 'KEYWORD_POLLUTION'; polluted: string[]; total: number };

export type RefusalReason =
  /** 90일 밖은 데이터가 없음 */
  | { code: 'OUT_OF_WINDOW'; windowDays: number }
  /** 스펙 비교 데이터 없음 */
  | { code: 'NO_COMPARISON' }
  /** 검색 결과 자체가 없음 */
  | { code: 'NO_RESULTS' };

export const MIN_SAMPLE_FOR_QUARTILE = 20;
export const PRICE_HISTORY_WINDOW_DAYS = 90;
