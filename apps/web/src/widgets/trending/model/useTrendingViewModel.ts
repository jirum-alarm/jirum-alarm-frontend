import { useSuspenseQueries } from '@tanstack/react-query';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { getDayBefore } from '@/shared/lib/utils/date';

import { ProductQueries } from '@/entities/product';

const TRENDING_ITEMS_LIMIT = 50;
const HOT_DEAL_COUNT_RANDOM = 20;
const HOT_DEAL_LIMIT_RANDOM = 10;

//NOTE: 3 : 화장품 , 5 : 도서 , 7 : 등산레저 , 8 : 상품권 , 10 : 육아
const ExtendStartDateCategories = [3, 5, 7, 8, 10];
const adjustStartDate = (categoryId: number | null) => {
  return categoryId !== null && ExtendStartDateCategories.includes(categoryId)
    ? getDayBefore(60)
    : getDayBefore(3);
};

const useTrendingViewModel = ({ categoryId }: { categoryId: number | null }) => {
  const isHotCategory = categoryId === null;
  // '전체' 탭은 id 0인 합성 카테고리다. 0을 그대로 넘기면 백엔드가 실제 카테고리 필터로 취급해
  // 결과가 항상 비므로 반드시 null(=필터 없음)로 바꿔 보낸다.
  const effectiveCategoryId = categoryId === 0 ? null : categoryId;

  const [products, live, hotDeals] = useSuspenseQueries({
    queries: [
      ProductQueries.products({
        limit: TRENDING_ITEMS_LIMIT,
        orderBy: ProductOrderType.CommunityRanking,
        startDate: adjustStartDate(effectiveCategoryId),
        categoryId: effectiveCategoryId,
        orderOption: OrderOptionType.Desc,
        isEnd: false,
      }),
      ProductQueries.products({
        limit: 10,
        orderBy: ProductOrderType.PostedAt,
        categoryId: isHotCategory ? null : effectiveCategoryId,
      }),
      ProductQueries.hotdealProductsRandom({
        count: HOT_DEAL_COUNT_RANDOM,
        limit: HOT_DEAL_LIMIT_RANDOM,
      }),
    ],
  });

  return {
    products: products.data.products,
    liveProducts: live.data.products,
    hotDeals: hotDeals.data.communityRandomRankingProducts,
  };
};

export default useTrendingViewModel;
