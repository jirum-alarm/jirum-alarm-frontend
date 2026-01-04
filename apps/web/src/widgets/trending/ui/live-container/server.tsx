import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';

import { CategoryQueries, getCategoriesForUser } from '@/entities/category';
import { ProductListQueries } from '@/entities/product-list';

import { LiveContainer } from '.';

const LIVE_ITEMS_LIMIT = 20;

type Props = {
  tab: number;
};

const LiveContainerServer = async ({ tab }: Props) => {
  const queryClient = new QueryClient();

  const { categories } = await getCategoriesForUser();
  queryClient.setQueryData(CategoryQueries.categoriesForUser().queryKey, {
    categories,
  });

  if (categories.find((c) => c.id === tab)) {
    queryClient.prefetchInfiniteQuery(
      ProductListQueries.infiniteProducts({
        limit: LIVE_ITEMS_LIMIT,
        orderBy: ProductOrderType.PostedAt,
        orderOption: OrderOptionType.Desc,
        categoryId: tab,
      }),
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LiveContainer initialTab={tab} />
    </HydrationBoundary>
  );
};

export default LiveContainerServer;
