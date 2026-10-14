/**
 * 카테고리 허브 = 랭킹 탭(`/trending/ranking?tab={categoryId}`). 카테고리 전용 URL 이 따로 없어서
 * 상품 → 카테고리로 가는 길(빵부스러기·「‘생활·식품’에서 인기있는 상품」 더보기)은 전부 이 주소를 쓴다.
 *
 * 탭 번호가 곧 카테고리 id 다(`widgets/trending/lib/tabMeta.ts` 의 인덱스). 0 은 「전체」라 카테고리가 아니고,
 * 13 이상은 없는 탭이라 canonical 이 tab=0 으로 모인다 — 둘 다 링크하지 않는다.
 */
export const CATEGORY_RANKING_TAB_MAX = 12;

export function categoryRankingPath(categoryId?: number | null): string | null {
  if (
    typeof categoryId !== 'number' ||
    !Number.isInteger(categoryId) ||
    categoryId < 1 ||
    categoryId > CATEGORY_RANKING_TAB_MAX
  ) {
    return null;
  }
  return `/trending/ranking?tab=${categoryId}`;
}
