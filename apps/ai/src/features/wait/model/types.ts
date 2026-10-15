/**
 * 「언제 사나」 — crawling-server `waitEstimate` 응답 모양(src/wait/dto/wait-estimate.output.ts 가 정본).
 * 판정 규칙·근거는 서버 src/wait/util/wait-estimate.ts.
 */
export type WaitUnit = 'LITER' | 'HUNDRED_GRAM' | 'COUNT' | 'FACE_VALUE' | 'TOTAL';
export type WaitKind = 'PRODUCT' | 'CATEGORY' | 'VOUCHER' | 'UNKNOWN';
export type WaitVerdict = 'BUY_NOW' | 'WAIT' | 'RARE' | 'NO_DATA';

export type WaitDeal = {
  id: number;
  title: string;
  price: number;
  unitPrice: number;
  postedAt: string;
  isEnd: boolean;
};

export type WaitPoint = { postedAt: string; unitPrice: number; live: boolean };

export type WaitEstimate = {
  label: string;
  kind: WaitKind;
  keyword: string;
  candidates: { keyword: string; dealCount: number }[];
  excludeKeywords: string[];
  unit: WaitUnit;
  priceFloor: number | null;
  priceCeiling: number | null;
  verdict: WaitVerdict;
  confident: boolean;
  dealCount: number;
  rawMatchCount: number;
  windowDays: number;
  p10: number | null;
  median: number | null;
  goodPrice: number | null;
  goodDays: number;
  typicalGapDays: number | null;
  lastGoodAt: string | null;
  current: WaitDeal | null;
  currentPercentile: number | null;
  goodDealCount: number;
  goodDeals: WaitDeal[];
  liveDeals: WaitDeal[];
  points: WaitPoint[];
};
