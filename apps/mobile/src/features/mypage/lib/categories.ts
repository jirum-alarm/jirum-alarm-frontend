import {
  INTEREST_CATEGORIES,
  MAX_INTEREST_CATEGORIES,
} from '@jirum/domain/categories';

/**
 * 관심 카테고리 선택 목록 — id·이름·순서는 정본 @jirum/domain/categories(web 마이페이지와 같은 표).
 * 서버에 보내는 값이 id 라서 하나만 어긋나도 엉뚱한 카테고리가 저장된다.
 *
 * ★그림은 여기 두지 않는다 — `NoImage` 의 `CATEGORY_ICON`(categoryId → 라인
 * 아이콘)을 재사용한다. web 은 이모지를 그리지만 앱은 라인 아이콘 체계가 이미
 * 있어 그쪽으로 맞췄다(이모지는 OS 마다 모양이 달라진다).
 */
export type CategoryOption = {
  text: string;
  value: number;
};

export const CATEGORIES: readonly CategoryOption[] = INTEREST_CATEGORIES.map(
  ({text, value}) => ({text, value}),
);

export const MAX_SELECTION_COUNT = MAX_INTEREST_CATEGORIES;
