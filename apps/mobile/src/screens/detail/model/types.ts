import type {ProductInfoQuery} from '@/shared/api/gql/graphql';

export type ProductDetail = NonNullable<ProductInfoQuery['product']>;

/**
 * 토스/오늘의집/네이버 블록의 원천. 백엔드가 product.data(JSONObject) 에 넣어주는
 * 자유형 값이라 스키마 타입이 없다 — 여기서만 좁혀 쓴다.
 */
export type TossData = {
  originalPrice?: number | null;
  discountRate?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  couponDiscount?: number | string | null;
  sellerName?: string | null;
  deliveryFee?: number | null;
  /** 숫자(20000) 또는 크롤러 원문('50,000원 이상 무료배송') — 표시는 formatFreeShipping */
  freeShippingThreshold?: number | string | null;
  images?: string[] | null;
  /** 신뢰 배지 — web toss-data.ts 와 같은 필드명. */
  lowestIn30Days?: boolean | null;
  bestSeller?: boolean | null;
  arrivalGuaranteed?: boolean | null;
  lowestPriceCompensation?: boolean | null;
  specialProduct?: boolean | null;
};

export type OhouData = Omit<
  TossData,
  'deliveryFee' | 'freeShippingThreshold'
> & {
  delivery?: string | null;
};

export type SourceData = {
  toss?: TossData;
  ohou?: OhouData;
  naverbc?: object;
};

/**
 * product.data 는 임의 JSON 이라 형태를 신뢰할 수 없다. 객체가 아닌 값이 와도
 * 화면이 죽지 않도록 여기서 한 번만 방어한다.
 */
export function parseSourceData(data: unknown): SourceData {
  if (!data || typeof data !== 'object') return {};
  const d = data as Record<string, unknown>;
  const pick = (k: string) =>
    d[k] && typeof d[k] === 'object' ? (d[k] as never) : undefined;
  return {toss: pick('toss'), ohou: pick('ohou'), naverbc: pick('naverbc')};
}

/** 무료배송 조건 문구. 크롤러가 원문 문자열을 넣기도 해서 숫자일 때만 문장을 만든다. */
export const formatFreeShipping = (threshold: number | string) =>
  typeof threshold === 'number'
    ? `${threshold.toLocaleString()}원 이상 무료배송`
    : threshold;

/** 상세 정보 표 「배송비」 값(web delivery-text.ts 와 같은 규칙). 토스는 배송비·무료배송 기준, 오늘의집은 받은 문구 그대로. 없으면 null. */
export function formatDeliveryText(source: SourceData): string | null {
  const {toss, ohou} = source;
  if (toss) {
    if (!toss.deliveryFee) return '무료배송';
    const threshold = toss.freeShippingThreshold
      ? ` (${formatFreeShipping(toss.freeShippingThreshold)})`
      : '';
    return `${toss.deliveryFee.toLocaleString()}원${threshold}`;
  }
  return ohou?.delivery || null;
}
