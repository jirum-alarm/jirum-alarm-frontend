import { ProductQueries } from '@/entities/product';
import useScreen from '@/hooks/useScreenSize';
import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { getDayBefore } from '@/util/date';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';

const TRENDING_ITEMS_LIMIT = 50;
const HOT_DEAL_COUNT_RANDOM = 20;
const HOT_DEAL_LIMIT_RANDOM = 10;

//NOTE: 3 : 화장품 , 5 : 도서 , 7 : 등산레저 , 8 : 상품권 , 10 : 육아
const ExtendStartDateCategories = [3, 5, 7, 8, 10];
const adjustStartDate = (categoryId: number | null) => {
  return categoryId !== null && ExtendStartDateCategories.includes(categoryId)
    ? getDayBefore(60)
    : getDayBefore(2);
};

const useTrendingViewModel = ({ categoryId }: { categoryId: number | null }) => {
  const isHotCategory = categoryId === null;
  const { smd } = useScreen();
  const firstRenderingCount = smd ? 9 : 10;

  const [products, live, hotDelas] = useSuspenseQueries({
    queries: [
      ProductQueries.products({
        limit: TRENDING_ITEMS_LIMIT,
        orderBy: ProductOrderType.CommunityRanking,
        startDate: adjustStartDate(categoryId),
        categoryId: categoryId,
        orderOption: OrderOptionType.Desc,
        isEnd: false,
      }),
      ProductQueries.products({
        limit: 10,
        orderBy: ProductOrderType.PostedAt,
        categoryId: isHotCategory ? null : categoryId,
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
    hotDeals: hotDelas.data.communityRandomRankingProducts,
    firstRenderingCount,
  };
};

export default useTrendingViewModel;
