import { useGetProductTrendingList } from '@/features/products';
import { IProduct } from '@/graphql/interface';
import { useTransition } from 'react';
import { useInView } from 'react-intersection-observer';

const TRENDING_ITEMS_LIMIT = 50;

const useTrendingViewModel = ({
  categoryId,
  isActive,
}: {
  categoryId: number;
  isActive: boolean;
}) => {
  const isHotCategory = categoryId === 0;
  const [isPending, startTransition] = useTransition();

  const { data, fetchMore } = useGetProductTrendingList(
    {
      variables: { limit: 10, categoryId: isHotCategory ? null : categoryId, isHot: isHotCategory },
      fetchPolicy: 'cache-and-network',
    },
    {
      suspenseSkip: !isActive,
    },
  );

  const products = data?.products;
  const { ref: loadingCallbackRef } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (!products) return;
      if (!inView) return;
      if (products.length >= TRENDING_ITEMS_LIMIT) return;
      loadMore();
    },
  });

  const loadMore = () => {
    startTransition(() => {
      const searchAfter = products?.at(-1)?.searchAfter;
      fetchMore({
        variables: {
          searchAfter,
        },
        updateQuery: (data, nextData) => {
          if (!data?.products) return { products: [] };
          if (!nextData.fetchMoreResult) return { products: [...data.products] };
          return {
            products: [...data.products, ...nextData.fetchMoreResult?.products],
          };
        },
      });
    });
  };

  return { products, loadingCallbackRef, isPending };
};

export default useTrendingViewModel;
