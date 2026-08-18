import {infiniteQueryOptions, queryOptions} from '@tanstack/react-query';

import {HomeService} from '@/shared/api/home/home.service';
import type {ProductCardType} from '@/entities/home/model/types';

/**
 * 발견 탭(실시간·랭킹) 데이터.
 * web 정본: widgets/trending/model/useLiveViewModel.ts · useTrendingViewModel.ts
 *
 * ★ web 은 SSR prefetch + useSuspenseQuery 지만 RN 엔 서버가 없어 전부
 * 클라이언트 useQuery 로 내려온다(홈과 같은 처방).
 */

const RETRY = 2;
const STALE_TIME = 1000 * 60;

export const LIVE_LIMIT = 20;
export const RANKING_LIMIT = 50;
/** 랭킹 목록에서 '실시간 핫딜' 캐러셀 위에 놓이는 카드 수. web SIZE. */
export const RANKING_SPLIT = 10;

const HOT_DEAL_COUNT_RANDOM = 20;
const HOT_DEAL_LIMIT_RANDOM = 10;

/**
 * 랭킹 기준 시작일. web adjustStartDate 와 같은 규칙 —
 * 물량이 적은 카테고리는 3일로 자르면 목록이 비어 60일까지 넓힌다.
 */
//NOTE: 3 : 화장품 , 5 : 도서 , 7 : 등산레저 , 8 : 상품권 , 10 : 육아
const EXTEND_START_DATE_CATEGORIES = [3, 5, 7, 8, 10];

/**
 * web `getDayBefore(n)` 과 같다(로컬 자정 기준).
 * dayjs 를 쓰지 않는 이유는 home.queries.ts 의 같은 함수 주석 참조
 * (테스트 러너가 dayjs ESM 을 못 읽는다).
 *
 * ★ startOf('day') 라 하루에 한 번만 값이 바뀐다 → queryKey 가 안정적이다
 * (querykey-time-granularity-trap).
 */
function getDayBeforeStartOfDay(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function rankingStartDate(categoryId: number | null): string {
  return getDayBeforeStartOfDay(
    categoryId !== null && EXTEND_START_DATE_CATEGORIES.includes(categoryId)
      ? 60
      : 3,
  );
}

/**
 * '전체' 탭은 id 0 인 합성 카테고리다. 0 을 그대로 넘기면 백엔드가 실제
 * 카테고리 필터로 취급해 결과가 항상 비므로 null(=필터 없음)로 바꿔 보낸다.
 */
function toServerCategoryId(categoryId: number): number | null {
  return categoryId === 0 ? null : categoryId;
}

/** 스키마가 categoryIds: [Int!] 를 받는다. 단일 선택이라 배열로 감싼다. */
function toCategoryIds(categoryId: number | null): number[] | null {
  return categoryId === null ? null : [categoryId];
}

export class TrendingQueries {
  static readonly keys = {
    all: ['trending'] as const,
    live: (categoryId: number) =>
      [...this.keys.all, 'live', categoryId] as const,
    ranking: (categoryId: number, startDate: string) =>
      [...this.keys.all, 'ranking', categoryId, startDate] as const,
    rankingLive: (categoryId: number) =>
      [...this.keys.all, 'rankingLive', categoryId] as const,
    recommended: () => [...this.keys.all, 'recommended'] as const,
  };

  /** 실시간 — 최신순 무한스크롤. */
  static live(categoryId: number) {
    const serverCategoryId = toServerCategoryId(categoryId);
    return infiniteQueryOptions({
      queryKey: this.keys.live(categoryId),
      initialPageParam: null as string[] | null,
      queryFn: ({pageParam}) =>
        HomeService.getProducts({
          limit: LIVE_LIMIT,
          orderBy: 'POSTED_AT' as never,
          orderOption: 'DESC' as never,
          categoryIds: toCategoryIds(serverCategoryId),
          searchAfter: pageParam,
        }) as Promise<ProductCardType[]>,
      // 마지막 행의 커서를 다음 시작점으로. 배열째 넘긴다(스키마가 [String!]).
      getNextPageParam: (lastPage: ProductCardType[]) => {
        if (lastPage.length < LIVE_LIMIT) return undefined;
        const cursor = (lastPage.at(-1) as {searchAfter?: string[]} | undefined)
          ?.searchAfter;
        return cursor && cursor.length > 0 ? cursor : undefined;
      },
      retry: RETRY,
      staleTime: STALE_TIME,
    });
  }

  /** 랭킹 본문 — 커뮤니티 랭킹순 단일 조회(web 도 페이지네이션이 없다). */
  static ranking(categoryId: number) {
    const serverCategoryId = toServerCategoryId(categoryId);
    const startDate = rankingStartDate(serverCategoryId);
    return queryOptions({
      queryKey: this.keys.ranking(categoryId, startDate),
      queryFn: () =>
        HomeService.getProducts({
          limit: RANKING_LIMIT,
          orderBy: 'COMMUNITY_RANKING' as never,
          orderOption: 'DESC' as never,
          startDate,
          categoryIds: toCategoryIds(serverCategoryId),
          isEnd: false,
        }) as Promise<ProductCardType[]>,
      retry: RETRY,
      staleTime: STALE_TIME,
    });
  }

  /** 랭킹 화면 안의 "'{카테고리}' 실시간 핫딜" 캐러셀. */
  static rankingLive(categoryId: number) {
    const serverCategoryId = toServerCategoryId(categoryId);
    return queryOptions({
      queryKey: this.keys.rankingLive(categoryId),
      queryFn: () =>
        HomeService.getProducts({
          limit: 10,
          orderBy: 'POSTED_AT' as never,
          categoryIds: toCategoryIds(serverCategoryId),
        }) as Promise<ProductCardType[]>,
      retry: RETRY,
      staleTime: STALE_TIME,
    });
  }

  /** 랭킹 화면 끝의 '추천 핫딜' 캐러셀. 카테고리와 무관하다(web 과 같다). */
  static recommended() {
    return queryOptions({
      queryKey: this.keys.recommended(),
      queryFn: () =>
        HomeService.getCommunityRandomRankingProducts({
          count: HOT_DEAL_COUNT_RANDOM,
          limit: HOT_DEAL_LIMIT_RANDOM,
        }) as Promise<ProductCardType[]>,
      retry: RETRY,
      staleTime: STALE_TIME,
    });
  }
}
