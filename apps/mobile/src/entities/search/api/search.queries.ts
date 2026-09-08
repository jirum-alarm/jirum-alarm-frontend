import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
} from '@tanstack/react-query';

import {CategoryService} from '@/shared/api/category';
import {HomeService} from '@/shared/api/home/home.service';
import {SearchService} from '@/shared/api/search';
import {ProductOrderType} from '@/shared/api/gql/graphql.ts';
import type {ProductCardType} from '@/entities/home/model/types';

import {
  periodStartDate,
  type SearchFilters,
  type SearchSort,
} from '../model/filters';

/** 전역 retry: false 를 되살린다(홈·상세와 같은 처방 — 모바일 네트워크는 자주 튄다). */
const RETRY = 2;
const STALE_TIME = 1000 * 60;

/** web limit. 한 페이지 20개. */
export const SEARCH_LIMIT = 20;

/** 제안어: web DEBOUNCE·캐시 값과 같다. */
export const SUGGESTION_LIMIT = 10;
const SUGGESTION_STALE_TIME = 60_000;
const SUGGESTION_GC_TIME = 300_000;

/**
 * 검색 결과에 실려 오는 총량 추정(Meili estimatedTotalHits, 5000 캡).
 * 모든 행에 같은 값이 주입되므로 첫 행에서만 읽는다(web 과 같다).
 */
export type SearchProductCard = ProductCardType & {
  searchAfter?: string[] | null;
  estimatedTotal?: number | null;
};

/**
 * web 이 정렬로 실제 보내는 값.
 * 'recent' 는 orderBy 를 **안 보낸다**(서버 기본이 최신순).
 *
 * ⚠️keyword 가 있으면 orderBy 5종이 무시된다(2026-08-10 실측). 아래 셋은
 * keyword 검색에서도 결과가 구별되는 값들이다 — 그래서 web 도 이 셋만 쓴다.
 */
function toOrderBy(sort: SearchSort): ProductOrderType | undefined {
  if (sort === 'relevance') return ProductOrderType.Relevance;
  if (sort === 'comments') return ProductOrderType.CommentCount;
  return undefined;
}

export class SearchQueries {
  static readonly keys = {
    all: ['search'] as const,
    products: (keyword: string, filters: SearchFilters) =>
      [...this.keys.all, 'products', keyword, filters] as const,
    suggestions: (prefix: string) =>
      [...this.keys.all, 'suggestions', prefix] as const,
    categories: () => [...this.keys.all, 'categories'] as const,
    providers: () => [...this.keys.all, 'providers'] as const,
  };

  /**
   * 검색 결과 무한 목록.
   *
   * ★web 의 `useInView` 센티넬은 `onEndReached` 로, `keepPreviousData` 는
   * `placeholderData: keepPreviousData` 로 옮긴다 — 필터를 바꿔 queryKey 가 변해도
   * 이전 결과를 들고 있어 목록이 한 번 비었다 다시 차는 깜빡임이 없다.
   */
  static products(keyword: string, filters: SearchFilters) {
    const startDate = periodStartDate(filters.period);
    return infiniteQueryOptions({
      queryKey: this.keys.products(keyword, filters),
      initialPageParam: null as string[] | null,
      queryFn: ({pageParam}) =>
        SearchService.getProducts({
          limit: SEARCH_LIMIT,
          searchAfter: pageParam,
          keyword: keyword || undefined,
          categoryIds:
            filters.categoryIds.length > 0 ? filters.categoryIds : undefined,
          providerIds:
            filters.providerIds.length > 0 ? filters.providerIds : undefined,
          startDate,
          // web: ended(품절 포함) ON 일 때만 isEnd: true — 서버에서 true 는 '종료 포함'.
          isEnd: filters.ended ? true : undefined,
          orderBy: toOrderBy(filters.sort),
        }) as Promise<SearchProductCard[]>,
      // 마지막 행의 커서를 다음 시작점으로. 배열째 넘긴다(스키마가 [String!]).
      getNextPageParam: (lastPage: SearchProductCard[]) => {
        if (lastPage.length < SEARCH_LIMIT) return undefined;
        const cursor = lastPage.at(-1)?.searchAfter;
        return cursor && cursor.length > 0 ? cursor : undefined;
      },
      placeholderData: keepPreviousData,
      retry: RETRY,
      staleTime: STALE_TIME,
      enabled: keyword.trim().length > 0,
    });
  }

  /** 자동완성. prefix 가 비면 호출하지 않는다(호출부가 게이트를 이미 통과시킨다). */
  static suggestions(prefix: string) {
    return queryOptions({
      queryKey: this.keys.suggestions(prefix),
      queryFn: () =>
        SearchService.getSuggestions({prefix, limit: SUGGESTION_LIMIT}),
      enabled: prefix.length > 0,
      // web 과 같은 캐시 — 같은 prefix 는 1분간 재요청하지 않는다.
      staleTime: SUGGESTION_STALE_TIME,
      gcTime: SUGGESTION_GC_TIME,
      retry: RETRY,
    });
  }

  /**
   * 필터의 카테고리 목록.
   *
   * ★발견 탭의 `categoriesForUser`(선호 카테고리만)가 **아니다** — web
   * SearchFilterBar 는 `CategoryQueries.categories()` 로 전체를 쓴다. 검색은
   * 선호 밖의 상품도 찾는 곳이라 선호로 좁히면 필터 자체가 못 쓰게 된다.
   */
  static categories() {
    return queryOptions({
      queryKey: this.keys.categories(),
      queryFn: () => CategoryService.getCategories(),
      // 카테고리는 거의 안 바뀐다(발견 탭과 같은 24시간).
      staleTime: 1000 * 60 * 60 * 24,
      retry: RETRY,
    });
  }

  /** 필터의 출처(커뮤니티) 목록. 홈 GRID_TABBED 가 쓰는 것과 같은 쿼리다. */
  static providers() {
    return queryOptions({
      queryKey: this.keys.providers(),
      queryFn: () => HomeService.getCommunityProviders(),
      staleTime: 1000 * 60 * 60 * 24,
      retry: RETRY,
    });
  }
}
