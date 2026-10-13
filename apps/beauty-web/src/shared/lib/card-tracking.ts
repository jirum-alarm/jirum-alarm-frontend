/**
 * 상품 카드 노출/클릭 계측 — web 과 같은 data-* 속성·같은 저장소 키를 쓴다.
 *
 * - 클릭: GTM 「상품 카드 클릭」 트리거가 `data-track="product-card"` 를 보고 data-source·product-id·rank 를 읽는다
 *   (web entities/product-list/model/card-tracking.ts). 같은 컨테이너라 이 앱 카드도 그대로 잡힌다.
 *   web 과 갈라 보는 값: data-source 가 beauty_home·beauty_ranking, 그리고 data-service="beauty".
 * - 상세 진입 출처: 카드 클릭 순간 localStorage 에 적으면 web 상세(CollectProductOnView → takeCardOrigin)가 꺼내
 *   post_view 에 싣는다 — 같은 도메인이라 앱이 달라도 이어진다(web card-click-origin.ts 와 같은 키·모양).
 * - 노출: ProductCardTracker 가 화면에 50% 이상 보인 카드를 recordProductImpressions 로 모아 보낸다.
 */

export const CARD_SELECTOR = '[data-track="product-card"]';

export interface CardTrackingInput {
  source: string;
  productId: string | number;
  /** 이 화면(source) 안에서의 0-based 위치 — 노출·클릭이 같은 값을 낸다. */
  position: number;
  /** 순위 배지가 있는 카드(1-based). GTM 이 data-rank 를 읽는다. */
  rank?: number;
  /** 한 화면 안 섹션 구분(home 의 ranking·toss·latest). GTM 변수로 꺼낼 수 있게 남긴다. */
  section?: string;
}

export function cardTrackingAttrs({
  source,
  productId,
  position,
  rank,
  section,
}: CardTrackingInput) {
  return {
    'data-track': 'product-card',
    'data-source': source,
    'data-product-id': String(productId),
    'data-position': String(position),
    'data-service': 'beauty',
    ...(rank !== undefined ? { 'data-rank': String(rank) } : {}),
    ...(section ? { 'data-section': section } : {}),
  } as const;
}

export type TrackedCard = { source: string; productId: number; position: number };

/** 카드 요소에서 계측값을 읽는다. 값이 이상하면 null(세지 않는다). */
export function readTrackedCard(el: Element): TrackedCard | null {
  const source = el.getAttribute('data-source');
  const productId = Number(el.getAttribute('data-product-id'));
  const position = Number(el.getAttribute('data-position'));
  if (!source || !Number.isInteger(productId) || productId <= 0) return null;
  if (!Number.isInteger(position) || position < 0) return null;
  return { source, productId, position };
}

/** web card-click-origin.ts CARD_CLICK_KEY 와 같은 키. */
const CARD_CLICK_KEY = 'jirum-alarm-card-click';

export function rememberCardClick(card: TrackedCard) {
  try {
    localStorage.setItem(CARD_CLICK_KEY, JSON.stringify({ ...card, at: Date.now() }));
  } catch {
    // 저장소가 막힌 브라우저 — 출처 없이 기록된다.
  }
}
