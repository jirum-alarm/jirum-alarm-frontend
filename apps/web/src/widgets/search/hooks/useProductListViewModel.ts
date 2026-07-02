import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { ProductQueries } from '@/entities/product';

const limit = 20;

export const useProductListViewModel = () => {
  const searchParams = useSearchParams();

  const keywordParam = searchParams.get('keyword');

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } = useSuspenseInfiniteQuery(
    ProductQueries.infiniteProducts({ limit, keyword: keywordParam || undefined } as any),
  );
  const pages = data?.pages ?? [];
  const products = Array.from(
    new Map(pages.flatMap((page) => page.products).map((p) => [p.id, p])).values(),
  );

  // 센티넬이 보이는 동안 다음 페이지를 연쇄 로드.
  // onChange(inView 토글)에 의존하면 센티넬이 계속 보이는 상태(짧은 결과·빠른 로드)에서 재발동하지
  // 않아 첫 페이지서 멈춘다 → inView 값을 effect로 감시해 hasNextPage/로딩완료마다 재시도.
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    products,
    hasNextPage,
    nextDataRef: ref,
    keyword: keywordParam,
    isFetchingNextPage,
  };
};
