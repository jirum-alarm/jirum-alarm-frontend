import { ProductQueries } from '@/entities/product';
import useScreen from '@/hooks/useScreenSize';
import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { getDayBefore } from '@/util/date';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';

const TRENDING_ITEMS_LIMIT = 50;
const HOT_DEAL_COUNT_RANDOM = 20;
const HOT_DEAL_LIMIT_RANDOM = 10;

const useTrendingViewModel = ({ categoryId }: { categoryId: number | null }) => {
  const isHotCategory = categoryId === null;
  const { smd } = useScreen();
  const firstRenderingCount = smd ? 9 : 10;

  const [products, live, hotDelas] = useSuspenseQueries({
    queries: [
      ProductQueries.products({
        limit: TRENDING_ITEMS_LIMIT,
        orderBy: ProductOrderType.CommunityRanking,
        startDate: getDayBefore(2),
        categoryId: categoryId,
        isHot: isHotCategory,
        orderOption: OrderOptionType.Desc,
      }),
      ProductQueries.products({
        limit: 10,
        orderBy: ProductOrderType.PostedAt,
        categoryId: isHotCategory ? null : categoryId,
        isHot: false,
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
