import { HOT_FEED_PAGE_SIZE } from '@jirum/domain/ranking';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';

import { CategoryQueries, getCategoriesForUser } from '@/entities/category';
import { ProductQueries } from '@/entities/product';

import { LiveContainer } from '.';

const LIVE_ITEMS_LIMIT = 20;

type Props = {
  tab: number;
  feed?: 'live' | 'hot';
};

const LiveContainerServer = async ({ tab, feed = 'live' }: Props) => {
  const queryClient = new QueryClient();

  const { categories } = await getCategoriesForUser();
  queryClient.setQueryData(CategoryQueries.categoriesForUser().queryKey, {
    categories,
  });

  if (feed === 'hot') {
    // 「전체」(0)도 미리 받는다 — 핫딜만은 대부분 전체로 들어온다.
    if (tab === 0 || categories.find((c) => c.id === tab)) {
      queryClient.prefetchInfiniteQuery(
        ProductQueries.infiniteHotDealFeed({
          limit: HOT_FEED_PAGE_SIZE,
          categoryIds: tab === 0 ? null : [tab],
        }),
      );
    }
  } else if (categories.find((c) => c.id === tab)) {
    queryClient.prefetchInfiniteQuery(
      ProductQueries.infiniteProducts({
        limit: LIVE_ITEMS_LIMIT,
        orderBy: ProductOrderType.PostedAt,
        orderOption: OrderOptionType.Desc,
        categoryId: tab,
      }),
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LiveContainer initialTab={tab} feed={feed} />
    </HydrationBoundary>
  );
};

export default LiveContainerServer;
