import { ProductQueries } from '@/entities/product';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';


const limit = 20;

const useLiveHotDealsViewModel = () => {
  const {
    data: { pages },
    fetchNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(
    ProductQueries.infiniteProducts({
      limit,
      orderBy: ProductOrderType.PostedAt,
      orderOption: OrderOptionType.Desc,
    }),
  );

  const products = Array.from(
    new Map(pages.flatMap((page) => page.products).map((p) => [p.id, p])).values(),
  );

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
