import type {PromotionQueryName} from '../model/types';

import {
  CURATION_PAGE_SIZE,
  isCursorPagedQuery,
} from '@jirum/domain/home-sections';

/** 더보기(큐레이션) 화면의 페이지 크기 — 정본(web 과 같은 값). */
export const CURATION_LIMIT = CURATION_PAGE_SIZE;

/** 커서 페이지네이션을 지원하는 queryName 인가 — 정본 isCursorPagedQuery(web 과 같은 판정). */
export function supportsInfinite(queryName: PromotionQueryName): boolean {
  return isCursorPagedQuery(queryName);
}
