import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { ProductListQueryVariables } from '@/shared/api/product';
import { getDayBefore } from '@/shared/lib/utils/date';

//NOTE: 3 : 화장품 , 5 : 도서 , 7 : 등산레저 , 8 : 상품권 , 10 : 육아
// 딜이 드문 카테고리는 3일이면 랭킹이 비어서 60일까지 본다.
const EXTEND_START_DATE_CATEGORIES = [3, 5, 7, 8, 10];

const rankingStartDate = (categoryId: number | null) =>
  categoryId !== null && EXTEND_START_DATE_CATEGORIES.includes(categoryId)
    ? getDayBefore(60)
    : getDayBefore(3);

/**
 * 커뮤니티 반응 순 랭킹 조회 조건 — 랭킹 탭(SSR 프리페치·클라)과 /beauty 랜딩이 같은 순서를 보도록 한 곳에 둔다.
 * categoryId null = 전체. 진행 중인 딜만(isEnd:false).
 */
export const rankingQueryVariables = (
  categoryId: number | null,
  limit: number,
): ProductListQueryVariables => ({
  limit,
  orderBy: ProductOrderType.CommunityRanking,
  startDate: rankingStartDate(categoryId),
  categoryId,
  orderOption: OrderOptionType.Desc,
  isEnd: false,
});
