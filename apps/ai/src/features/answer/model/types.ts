export type Deal = {
  id: number;
  title: string;
  url: string | null;
  thumbnail: string | null;
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

/**
 * 가격 추이 근거의 세기. 백엔드 `PriceHistoryConfidence` 를 그대로 받는다.
 *
 * ★실측(2026-08-07, 운영 GraphQL 6키워드 300건): **HIGH 는 2건(0.7%)** 이고
 * 나머지는 전부 LOW(=유사상품 추정)다. 라면은 50건 중 점 5개 이상이 1건뿐.
 * 그래서 confidence 를 안 들고 오면 0.7% 만 진짜인 판정을 100% 확신처럼 보여준다.
 */
export type PriceConfidence = 'HIGH' | 'LOW';

/** 가격 추이 한 점. 같은 딜이 여러 날에 실려 오므로 dealId 로 중복을 지운다. */
export type PricePoint = { date: string; price: number; dealId: number; isSeed: boolean };

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
  /** LOW 면 카피가 단정하지 않는다. UI 가 아니라 근거의 성질이라 블록에 담는다. */
  confidence: PriceConfidence;
};

/**
 * 판정을 낼 최소 점 개수. 백엔드는 SIMILAR 를 2점부터 노출하지만(희소해서),
 * 2점으로 percentile 을 내면 "최저 아니면 최고" 둘 중 하나가 된다 — 판정이 아니라 동전던지기다.
 */
export const MIN_POINTS_FOR_POSITION = 4;

/**
 * 추이를 **그릴** 최소 시점 개수. 위치 판정(MIN_POINTS_FOR_POSITION)과 따로 두는 이유:
 * 판정은 서로 다른 딜의 개수가 중요하지만, 추이는 **서로 다른 날짜**의 개수가 중요하다.
 * 2개 날짜는 선분이라 방향을 말할 근거가 안 된다.
 */
export const MIN_POINTS_FOR_TREND = 3;

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
