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

/** 상품 카드가 렌더되는 진입 경로. snake_case (기존 이벤트 네이밍 컨벤션 일치). */
export type ProductCardSource =
  | 'home_ranking' // 홈 지름 랭킹 슬라이더
  | 'home_promotion' // 홈 프로모션 섹션 (grid/carousel/double_row/list)
  | 'search' // 검색 결과
  | 'search_recommend' // 검색 초기 추천 캐러셀
  | 'ranking_tab' // 트렌딩 랭킹 그리드 (기존 추적과 동일 명칭)
  | 'trending_live' // 트렌딩 실시간 핫딜 캐러셀
  | 'trending_recommend' // 트렌딩 추천 핫딜 캐러셀
  | 'wishlist' // 찜 목록
  | 'related' // 관련 상품
  | 'keyword_recommend' // 키워드 추천
  | 'together_viewed' // 함께 본 상품
  | 'category_popular' // 카테고리 인기
  | 'notification_theme' // 알림 묶음 상세 라이브딜
  | 'expired_latest' // 종료 딜 상세의 '최신 핫딜' 블록
  | 'live_alternative' // 진행 중 딜 상세의 '다른 곳 진행 중인 딜' 블록
  | 'toss_internal_link' // 토스 상세의 '토스에서 함께 보는 상품'(실험 toss_internal_link_v1)
  | 'season_hub'; // 해외직구 시즌 허브(/season/2026-black-friday)의 직구 딜

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
