import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { ProductOrderType } from '@/shared/api/gql/graphql';

import { ProductQueries } from '@/entities/product';

import { SearchFiltersController } from './useSearchFilters';

const limit = 20;

/**
 * filters는 인자로 받는다 — 필터 상태 소유자는 SearchResult 하나뿐(인스턴스 중복 방지).
 *
 * suspense 대신 keepPreviousData를 쓴다: 필터 변경으로 queryKey가 바뀌어도 이전 결과를
 * 유지한 채 새 데이터로 교체(isPlaceholderData로 디밍). suspense+transition 조합은 Next가
 * history 변경을 urgent 재렌더로 동기화하면서 fallback(빈 화면)으로 떨어지는 것을 실측으로
 * 확인해 폐기.
 */
export const useProductListViewModel = ({
  filters,
}: {
  filters: SearchFiltersController['filters'];
}) => {
  const searchParams = useSearchParams();

  const keywordParam = searchParams.get('keyword');

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading, isPlaceholderData } =
    useInfiniteQuery({
      ...ProductQueries.infiniteProducts({
        limit,
        keyword: keywordParam || undefined,
        categoryId: filters.categoryId > 0 ? filters.categoryId : undefined,
        providerId: filters.providerId > 0 ? filters.providerId : undefined,
        // ended(품절 포함) ON일 때만 isEnd: true — 백엔드에서 true는 '종료 포함' 의미.
        isEnd: filters.ended ? true : undefined,
        orderBy: filters.sort === 'relevance' ? ProductOrderType.Relevance : undefined,
      } as any),
      placeholderData: keepPreviousData,
    });
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
    isLoading,
    isPlaceholderData,
  };
};
