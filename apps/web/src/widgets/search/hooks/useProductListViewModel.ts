import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';

import { ProductQueries } from '@entities/product';

const limit = 20;

export const useProductListViewModel = () => {
  const searchParams = useSearchParams();

  const keywordParam = searchParams.get('keyword');

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } = useSuspenseInfiniteQuery(
    ProductQueries.infiniteProducts({ limit, keyword: keywordParam || undefined } as any),
  );
  const pages = data?.pages ?? [];
  const products = pages.flatMap((page) => page.products);

  const { ref } = useInView({
    onChange(inView) {
      if (inView && products && hasNextPage) {
        fetchMoreProducts();
      }
    },
  });

  const fetchMoreProducts = () => {
    if (products && products.length >= limit) {
      fetchNextPage();
    }
  };

  return {
    products,
    hasNextPage,
    nextDataRef: ref,
    keyword: keywordParam,
    isFetchingNextPage,
  };
};
