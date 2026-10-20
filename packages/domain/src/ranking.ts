/**
 * 발견 탭 랭킹(커뮤니티 반응 순)의 기간 규칙 — web 랭킹 탭·앱 발견 탭이 같이 쓴다.
 * 날짜 계산(KST 자정 등)은 플랫폼 도구가 다르니 각 앱에서, «며칠 볼지»만 여기 있다(2026-10-20 정본화).
 */

/** 딜이 드문 카테고리 — 3 화장품, 5 도서, 7 등산레저, 8 상품권, 10 육아. 3일로 자르면 랭킹이 빈다. */
export const SPARSE_RANKING_CATEGORY_IDS: readonly number[] = [3, 5, 7, 8, 10];

/** 랭킹을 며칠 전부터 볼지. categoryId null = 전체. */
export function rankingWindowDays(categoryId: number | null): number {
  return categoryId !== null && SPARSE_RANKING_CATEGORY_IDS.includes(categoryId) ? 60 : 3;
}
