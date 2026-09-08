/**
 * 관심 카테고리 선택 목록. **web `shared/config/categories.ts` 의 순서·이모지·id
 * 를 그대로 유지해야 한다** — 서버에 보내는 값이 id 라서 하나만 어긋나도 엉뚱한
 * 카테고리가 저장된다. 순서도 web 화면과 같아야 "3열 그리드의 그 자리"가 맞는다.
 *
 * ★web `CategoriesForm` 은 `iconComponent` 가 아니라 **`icon`(이모지)** 를 그린다.
 * 아이콘 SVG 를 옮길 필요가 없다.
 */
export type CategoryOption = {
  icon: string;
  text: string;
  value: number;
};

export const CATEGORIES: readonly CategoryOption[] = [
  {icon: '💻', text: '컴퓨터', value: 1},
  {icon: '🛒', text: '생활/식품', value: 2},
  {icon: '💄', text: '화장품', value: 3},
  {icon: '📗', text: '도서', value: 5},
  {icon: '🛏', text: '가전/가구', value: 6},
  {icon: '🧗‍♀️', text: '등산/레저', value: 7},
  {icon: '🎮', text: '디지털', value: 9},
  {icon: '🍼', text: '육아', value: 10},
  {icon: '💸', text: '상품권', value: 8},
  {icon: '👕', text: '의류/잡화', value: 4},
  {icon: '🔍', text: '기타', value: 11},
];

export const MAX_SELECTION_COUNT = 5;
