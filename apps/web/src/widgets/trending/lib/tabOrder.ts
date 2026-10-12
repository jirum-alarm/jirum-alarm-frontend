/**
 * 발견(실시간·랭킹) 카테고리 탭 순서. 서버는 id 순으로 주지만 탭 줄만 여기 순서로 다시 세운다
 * (키워드·관심 카테고리 화면은 서버 순서 그대로).
 *
 * ★왜(2026-10-13): GA4 웹 탭 이동 28일 실측 — 옆으로 넘기면 앞 탭을 거치므로 앞자리일수록 수가 부푸는데도
 * 디지털(9번째)이 3~8번째를 다 이겼고, 의류·잡화가 바로 앞 화장품의 2배, 도서는 5번째인데 9위였다.
 * 그 자리를 거슬러 이긴 것만 옮겼다. 육아는 화장품 뒤(사용자 지정). 기타는 인기와 무관하게 항상 끝.
 * 앱 `apps/mobile/src/screens/trending/trending-tab-order.ts` 와 같은 순서여야 한다.
 * 판독: crawling-server experiment-registry `trending-tab-order`.
 */
const TAB_ORDER = [1, 9, 2, 4, 6, 3, 10, 8, 7, 5]; // 컴퓨터·디지털·생활식품·의류잡화·가전가구·화장품·육아·상품권·등산레저·도서
const OTHER_CATEGORY_ID = 11; // 기타

const rankOf = (id: number) => {
  if (id === OTHER_CATEGORY_ID) return Number.MAX_SAFE_INTEGER;
  const index = TAB_ORDER.indexOf(id);
  // 새로 생긴 카테고리는 아는 것 뒤·기타 앞에(서버 순서 유지).
  return index === -1 ? TAB_ORDER.length : index;
};

export const orderTrendingCategories = <T extends { id: number }>(categories: readonly T[]): T[] =>
  [...categories].sort((a, b) => rankOf(a.id) - rankOf(b.id));
