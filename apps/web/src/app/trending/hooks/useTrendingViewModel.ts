import { useGetProductTrendingList } from '@/features/products';
import { ProductOrderType } from '@/graphql/interface';
import { getDayBefore } from '@/util/date';
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

  const { data: trending, fetchMore } = useGetProductTrendingList(
    {
      variables: {
        limit: 10,
        orderBy: ProductOrderType.COMMUNITY_RANKING,
        startDate: getDayBefore(7),
        categoryId: isHotCategory ? null : categoryId,
        isHot: isHotCategory,
      },
      fetchPolicy: 'cache-and-network',
    },
    {
      suspenseSkip: !isActive,
    },
  );

  const products = trending?.products;
  const { data: live } = useGetProductTrendingList(
    {
      variables: {
        limit: 10,
        orderBy: ProductOrderType.POSTED_AT,
        categoryId: isHotCategory ? null : categoryId,
        isHot: false,
      },
    },
    {
      suspenseSkip: !isActive || isHotCategory,
    },
  );

  const liveProducts = live?.products;

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

  return { products, liveProducts, loadingCallbackRef, isPending };
};

export default useTrendingViewModel;
