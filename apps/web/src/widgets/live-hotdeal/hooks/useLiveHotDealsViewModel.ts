import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';

import { ProductListQueries } from '@/entities/product-list';

const limit = 20;

const useLiveHotDealsViewModel = () => {
  const {
    data: { pages },
    fetchNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(
    ProductListQueries.infiniteProducts({
      limit,
      orderBy: ProductOrderType.PostedAt,
      orderOption: OrderOptionType.Desc,
    }),
  );

  const products = pages.flatMap((page) => page.products);

  const { ref: loadingCallbackRef } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && products.length >= limit) {
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

export default useLiveHotDealsViewModel;
