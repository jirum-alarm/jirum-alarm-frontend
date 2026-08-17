import type {PromotionQueryName} from '../model/types';

/**
 * 더보기(큐레이션) 화면의 페이지 크기. web CurationProductList 의 LIMIT 과 같다.
 */
export const CURATION_LIMIT = 20;

/**
 * 커서 페이지네이션을 지원하는 queryName 인가.
 *
 * queryName 5종 중 3종만 `searchAfter` 를 받는다. 나머지 둘(hotDealRanking·
 * guestRecommended)은 page 인자지만 web 도 단일 조회로 쓰므로 그대로 맞춘다.
 */
export function supportsInfinite(queryName: PromotionQueryName): boolean {
  return (
    queryName === 'productsByKeyword' ||
    queryName === 'products' ||
    queryName === 'expiringSoonHotDealProducts'
  );
}
