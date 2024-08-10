import { ProductQueries } from '@/entities/product';
import useScreen from '@/hooks/useScreenSize';
import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { getDayBefore } from '@/util/date';
import { useSuspenseQuery } from '@tanstack/react-query';

const TRENDING_ITEMS_LIMIT = 50;

const useTrendingViewModel = ({ categoryId }: { categoryId: number | null }) => {
  const isHotCategory = categoryId === null;
  const { smd } = useScreen();
  const firstRenderingCount = smd ? 9 : 10;

  const {
    data: { products },
  } = useSuspenseQuery(
    ProductQueries.products({
      limit: TRENDING_ITEMS_LIMIT,
      orderBy: ProductOrderType.CommunityRanking,
      startDate: getDayBefore(2),
      categoryId: categoryId,
      isHot: isHotCategory,
      orderOption: OrderOptionType.Desc,
    }),
  );

  const { data: live } = useSuspenseQuery(
    ProductQueries.products({
      limit: 10,
      orderBy: ProductOrderType.PostedAt,
      categoryId: isHotCategory ? null : categoryId,
      isHot: false,
    }),
  );

  return {
    products,
    liveProducts: live.products,
    firstRenderingCount,
  };
};

export default useTrendingViewModel;
