import { ProductQueries } from '@/entities/product';

import { rankingQueryVariables } from '@/widgets/trending/lib/rankingQuery';

/** 화장품 카테고리(shared/config/categories 의 '화장품'). 랭킹 탭 ?tab=3 과 같은 카테고리. */
const BEAUTY_CATEGORY_ID = 3;

/** 서버가 HTML 에 그리는 첫 페이지 크기 — 나머지는 스크롤하면 이어 받는다. */
const BEAUTY_PAGE_SIZE = 20;

/**
 * 랭킹 탭(화장품)과 같은 조건·순서(커뮤니티 반응 순, 진행 중인 딜만, 최근 60일)를 무한 스크롤로.
 * 랭킹 순서도 searchAfter 로 이어진다(2026-10-14 운영 API 실측: 2쪽째가 1쪽 마지막 점수 아래로 중복 없이 이어짐).
 */
export const beautyDealsVariables = () =>
  rankingQueryVariables(BEAUTY_CATEGORY_ID, BEAUTY_PAGE_SIZE);

export const beautyDealsQuery = () =>
  ProductQueries.infiniteRankingProducts(beautyDealsVariables());
