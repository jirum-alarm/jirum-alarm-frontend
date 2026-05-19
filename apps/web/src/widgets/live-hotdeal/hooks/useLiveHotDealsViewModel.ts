import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';

import { ProductQueries } from '@/entities/product';

const limit = 20;

const useLiveHotDealsViewModel = () => {
  const {
    data: { pages },
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
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

  const { ref: loadingCallbackRef, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, pages.length, fetchNextPage]);

  return {
    products,
    loadingCallbackRef,
    isFetchingNextPage,
  };
};

export default useLiveHotDealsViewModel;
