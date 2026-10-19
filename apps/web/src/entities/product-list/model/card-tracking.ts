/**
 * 상품 카드 클릭 추적용 data-* 속성.
 *
 * 계측은 GTM이 한다(코드가 직접 push하지 않음). 카드 상세링크에 아래 data 속성을
 * 박아두면, GTM Click 트리거 「상품 카드 클릭」이 `data-track="product-card"`를 보고 발화하면서
 * source/product-id/rank를 읽어 보낸다 — ⚠️GA4 엔 `select_item`(태그 「상품 카드 클릭」),
 * (Mixpanel 태그는 2026-10-17 GTM v58 에서 일시중지). 앱은 GA4 에도 `product_card_click` 이라 웹·앱을 합쳐 볼 땐
 * 두 이름을 같이 센다(2026-10-13 "웹 0건" 오판 — 이름만 달랐다).
 *
 * 진입 경로(source)별 전환율(= 어디서 클릭한 게 구매까지 가나)을 보기 위한 것.
 */
import type { ProductCardSource } from '@jirum/domain/card-tracking';

export type { ProductCardSource } from '@jirum/domain/card-tracking';

export interface ProductCardTrackingAttrs {
  'data-track': 'product-card';
  'data-source': ProductCardSource;
  'data-product-id': string | number;
  'data-rank'?: number;
}

/**
 * 카드 상세링크에 spread할 data-* 속성을 만든다. source가 없으면 빈 객체(추적 안 함).
 *
 * @example
 * <Link href={...} {...productCardTracking(source, product.id, rank)}>
 */
export function productCardTracking(
  source: ProductCardSource | undefined,
  productId: string | number,
  rank?: number,
): ProductCardTrackingAttrs | Record<string, never> {
  if (!source) return {};
  return {
    'data-track': 'product-card',
    'data-source': source,
    'data-product-id': productId,
    ...(rank !== undefined ? { 'data-rank': rank } : {}),
  };
}
