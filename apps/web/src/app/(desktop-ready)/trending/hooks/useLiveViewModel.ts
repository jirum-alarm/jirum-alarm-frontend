import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

import { OrderOptionType, ProductOrderType } from '@shared/api/gql/graphql';

import { ProductQueries } from '@entities/product';

const LIVE_ITEMS_LIMIT = 20;

const useLiveViewModel = ({ categoryId }: { categoryId: number | null }) => {
  const {
    data: { pages },
    fetchNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(
    ProductQueries.infiniteProducts({
      limit: LIVE_ITEMS_LIMIT,
      orderBy: ProductOrderType.PostedAt,
      orderOption: OrderOptionType.Desc,
      categoryId: categoryId,
    }),
  );

  const products = pages.flatMap((page) => page.products);

  const { ref: loadingCallbackRef } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && products.length >= LIVE_ITEMS_LIMIT) {
        fetchNextPage();
      }
    },
  });

  return {
    products,
    loadingCallbackRef,
    isFetchingNextPage,
  };
};

export default useLiveViewModel;
