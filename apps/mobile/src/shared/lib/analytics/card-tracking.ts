import {Analytics} from './ga4';

/**
 * 상품 카드 클릭 추적 — web `entities/product-list/model/card-tracking.ts` 와 같은 규격.
 *
 * web 은 카드 링크의 data-* 속성을 GTM 이 읽어 같은 파라미터(source, product_id, rank)로
 * GA4 에 보낸다 — ⚠️단 web 의 GA4 이벤트 이름은 `select_item` 이다(Mixpanel 만 product_card_click).
 * 앱은 GTM 이 없으니 카드 onPress 에서 직접 보낸다 — 같은 GA4 속성이라 진입 경로별 전환율을
 * 웹(select_item)·앱(product_card_click) 합쳐서 볼 수 있다.
 *
 * ⚠️유니온 값은 web 과 한 글자도 다르면 안 된다(GA4 리포트에서 다른 경로로 갈린다).
 */
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
  | 'keyword_hub' // 키워드 허브 화면 목록(앱만 — web 허브 그리드는 아직 source 를 안 붙인다)
  | 'live_alternative'; // 진행 중 딜 상세의 '다른 곳 진행 중인 딜' 블록

/**
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
