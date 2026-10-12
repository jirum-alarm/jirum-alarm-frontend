/**
 * 발견(실시간·랭킹) 카테고리 칩 순서. 서버는 id 순으로 주지만 칩 줄만 여기 순서로 다시 세운다
 * (키워드·관심 카테고리 화면은 서버 순서 그대로).
 *
 * ★왜(2026-10-13): web 탭 이동 실측(GA4 28일)으로 정했다 — 앱은 그때 칩 선택 이벤트가 없어 못 쟀다.
 * 근거·판독은 web `widgets/trending/lib/tabOrder.ts` 와 같고, 순서도 한 글자 다르지 않아야 한다.
 * 기타는 인기와 무관하게 항상 끝.
 */
const TAB_ORDER = [1, 9, 2, 4, 6, 3, 10, 8, 7, 5]; // 컴퓨터·디지털·생활식품·의류잡화·가전가구·화장품·육아·상품권·등산레저·도서
const OTHER_CATEGORY_ID = 11; // 기타

function rankOf(id: number): number {
  if (id === OTHER_CATEGORY_ID) return Number.MAX_SAFE_INTEGER;
  const index = TAB_ORDER.indexOf(id);
  // 새로 생긴 카테고리는 아는 것 뒤·기타 앞에(서버 순서 유지).
  return index === -1 ? TAB_ORDER.length : index;
}

export function orderTrendingCategories<T extends {id: number}>(
  categories: readonly T[],
): T[] {
  return [...categories].sort((a, b) => rankOf(a.id) - rankOf(b.id));
}
