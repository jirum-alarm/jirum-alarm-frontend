import type {ProductCardSource} from '@jirum/domain/card-tracking';

import {Analytics} from './ga4';

export type {ProductCardSource} from '@jirum/domain/card-tracking';

/**
 * 상품 카드 클릭 추적 — web `entities/product-list/model/card-tracking.ts` 와 같은 규격.
 *
 * web 은 카드 링크의 data-* 속성을 GTM 이 읽어 같은 파라미터(source, product_id, rank)로
 * GA4 에 보낸다 — ⚠️단 web 의 GA4 이벤트 이름은 `select_item` 이다(Mixpanel 만 product_card_click).
 * 앱은 GTM 이 없으니 카드 onPress 에서 직접 보낸다 — 같은 GA4 속성이라 진입 경로별 전환율을
 * 웹(select_item)·앱(product_card_click) 합쳐서 볼 수 있다.
 *
 * 진입 경로 값(ProductCardSource)은 @jirum/domain/card-tracking 한 곳 — web 과 같은 원본.
 *
 * source 가 없으면 아무것도 안 보낸다(web productCardTracking 이 빈 객체를 주는 것과 같다).
 * rank 는 web 이 넘기는 목록(home_ranking·ranking_tab)에서만, 1-based.
 */
export function trackProductCardClick(
  source: ProductCardSource | undefined,
  productId: string | number,
  rank?: number,
): void {
  if (!source) return;
  Analytics.track('product_card_click', {
    source,
    // web 은 DOM data 속성이라 GTM 이 문자열로 읽는다 — 타입을 맞춘다.
    product_id: String(productId),
    rank,
  });
}
