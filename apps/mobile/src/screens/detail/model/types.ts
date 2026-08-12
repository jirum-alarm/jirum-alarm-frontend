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
  freeShippingThreshold?: number | null;
  images?: string[] | null;
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
