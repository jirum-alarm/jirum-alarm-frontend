import {
  periodStartDate,
  SEARCH_PAGE_SIZE,
  searchFilterVariables,
  searchOrderBy,
} from '@jirum/domain/search';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { ProductOrderType } from '@/shared/api/gql/graphql';

import { ProductQueries } from '@/entities/product';

import { SearchFiltersController } from './useSearchFilters';

const limit = SEARCH_PAGE_SIZE;

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

  // period가 바뀔 때만 재계산 — 렌더마다 new Date()를 만들면 queryKey가 매번 달라져 무한 refetch.
  const startDate = useMemo(() => {
    // 기간이 바뀔 때만 "지금" 기준 시작 시각을 다시 잡는다(useMemo 로 렌더마다 바뀌지 않음).
    // eslint-disable-next-line react-hooks/purity
    return periodStartDate(filters.period, Date.now());
  }, [filters.period]);

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isLoading, isPlaceholderData } =
    useInfiniteQuery({
      ...ProductQueries.infiniteProducts({
        limit,
        keyword: keywordParam || undefined,
        // 필터 변수(빈 칩 생략·품절 포함·정렬)는 정본 — 앱 검색 목록과 같은 값.
        ...searchFilterVariables(filters, startDate),
        orderBy: searchOrderBy(filters.sort) as ProductOrderType | undefined,
      }),
      placeholderData: keepPreviousData,
      // 키워드 없는 /search 랜딩에서도 SearchResult 가 마운트된다. 이때까지 켜 두면
      // 전체 상품을 받아 두고, 검색 직후 keepPreviousData 가 그 목록을 잠깐 보여준다.
      enabled: !!keywordParam,
    });
  const pages = data?.pages ?? [];
  const products = Array.from(
    new Map(pages.flatMap((page) => page.products).map((p) => [p.id, p])).values(),
  );
  // 결과 총량 추정(Meili estimatedTotalHits, 5000 캡) — 모든 행에 동일 주입되므로 첫 행에서 읽음.
  // QueryProducts는 인라인 TypedDocumentString이라 codegen이 estimatedTotal을 결과 타입에 안 넣음 → 좁은 캐스팅.
  const estimatedTotal =
    (pages[0]?.products[0] as { estimatedTotal?: number | null } | undefined)?.estimatedTotal ??
    undefined;
  // 오타 교정어(서버가 0건·일부 일치 검색어를 고쳐 찾았을 때). estimatedTotal 처럼 모든 행 동일 — 첫 행에서 읽는다.
  const correctedKeyword =
    (pages[0]?.products[0] as { correctedKeyword?: string | null } | undefined)?.correctedKeyword ??
    undefined;

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
    estimatedTotal,
    correctedKeyword,
  };
};
