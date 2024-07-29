import { useGetProductTrendingList } from '@/features/products';
import { ProductOrderType } from '@/graphql/interface';
import useScreen from '@/hooks/useScreenSize';
import { getDayBefore } from '@/util/date';
import { p } from 'msw/lib/core/GraphQLHandler-COiPfZ8k';
import { useTransition } from 'react';
import { useInView } from 'react-intersection-observer';

const TRENDING_ITEMS_LIMIT = 50;

const useTrendingViewModel = ({
  categoryId,
  isActive,
}: {
  categoryId: number | null;
  isActive: boolean;
}) => {
  const isHotCategory = categoryId === null;
  const [isPending, startTransition] = useTransition();
  const { smd } = useScreen();
  const firstRenderingCount = smd ? 9 : 10;

  const { data: trending, fetchMore } = useGetProductTrendingList(
    {
      variables: {
        limit: 12,
        orderBy: ProductOrderType.COMMUNITY_RANKING,
        startDate: getDayBefore(7),
        categoryId: categoryId,
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
          const products = [...data.products, ...nextData.fetchMoreResult?.products];
          if (products.length >= TRENDING_ITEMS_LIMIT) {
            return { products: products.slice(0, TRENDING_ITEMS_LIMIT) };
          }

          return {
            products,
          };
        },
      });
    });
  };

  return { products, liveProducts, loadingCallbackRef, isPending, firstRenderingCount };
};

export default useTrendingViewModel;
