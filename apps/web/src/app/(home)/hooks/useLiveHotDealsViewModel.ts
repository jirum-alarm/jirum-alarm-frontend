import { QueryProducts } from '@/graphql';
import { IProductOutput, OrderOptionType, ProductOrderType } from '@/graphql/interface';
import { useSuspenseQuery } from '@apollo/client';
import { useTransition } from 'react';
import { useInView } from 'react-intersection-observer';

const limit = 20;

const useLiveHotDealsViewModel = () => {
  const [isPending, startTransition] = useTransition();

  const {
    data: { products },
    fetchMore,
  } = useSuspenseQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit,
      orderBy: ProductOrderType.POSTED_AT,
      orderByOption: OrderOptionType.DESC,
    },
  });

  const { ref: loadingCallbackRef } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (!inView) return;
      loadMore();
    },
  });

  const loadMore = () => {
    startTransition(() => {
      const searchAfter = products.at(-1)?.searchAfter;
      fetchMore({
        variables: {
          searchAfter,
        },
        updateQuery: ({ products }, { fetchMoreResult }) => {
          return {
            products: [...products, ...fetchMoreResult.products],
          };
        },
      });
    });
  };

  return { products, loadingCallbackRef, isPending };
};

export default useLiveHotDealsViewModel;
