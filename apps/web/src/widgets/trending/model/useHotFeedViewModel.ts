import { HOT_FEED_PAGE_SIZE } from '@jirum/domain/ranking';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

import { ProductQueries } from '@/entities/product';

const useHotFeedViewModel = ({ categoryId }: { categoryId: number | null }) => {
  const {
    data: { pages },
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useSuspenseInfiniteQuery(
    ProductQueries.infiniteHotDealFeed({
      limit: HOT_FEED_PAGE_SIZE,
      categoryIds: categoryId === null ? null : [categoryId],
    }),
  );

  const products = pages.flatMap((page) => page.hotDealFeedProducts);

  const { ref: loadingCallbackRef } = useInView({
    threshold: 0,
    rootMargin: '400px 0px',
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
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

export default useHotFeedViewModel;
