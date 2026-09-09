/**
 * 관심 카테고리 선택 목록. **web `shared/config/categories.ts` 의 순서·이모지·id
 * 를 그대로 유지해야 한다** — 서버에 보내는 값이 id 라서 하나만 어긋나도 엉뚱한
 * 카테고리가 저장된다. 순서도 web 화면과 같아야 "3열 그리드의 그 자리"가 맞는다.
 *
 * ★그림은 여기 두지 않는다 — `NoImage` 의 `CATEGORY_ICON`(categoryId → 라인
 * 아이콘)을 재사용한다. web 은 이모지를 그리지만 앱은 라인 아이콘 체계가 이미
 * 있어 그쪽으로 맞췄다(이모지는 OS 마다 모양이 달라진다).
 */
export type CategoryOption = {
  text: string;
  value: number;
};

export const CATEGORIES: readonly CategoryOption[] = [
  {text: '컴퓨터', value: 1},
  {text: '생활/식품', value: 2},
  {text: '화장품', value: 3},
  {text: '도서', value: 5},
  {text: '가전/가구', value: 6},
  {text: '등산/레저', value: 7},
  {text: '디지털', value: 9},
  {text: '육아', value: 10},
  {text: '상품권', value: 8},
  {text: '의류/잡화', value: 4},
  {text: '기타', value: 11},
];

export const MAX_SELECTION_COUNT = 5;
