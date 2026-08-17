import {infiniteQueryOptions, queryOptions} from '@tanstack/react-query';

import {HomeService} from '@/shared/api/home/home.service';
import {TOSS_SECTION_KEYWORD} from '../lib/toss';
import {CURATION_LIMIT} from '../lib/curation';
import type {AdvertiseSlotLocation} from '@/shared/api/gql/graphql.ts';

import type {ContentPromotionSection, ProductCardType} from '../model/types';

/**
 * ReactQueryProvider 가 retry: false 를 전역으로 걸어둔 탓에 네트워크가 한 번만
 * 튀어도 섹션이 즉시 에러가 된다. 홈은 섹션이 7개라 하나만 튀어도 눈에 띈다.
 * (상세 쿼리와 같은 처방 — product.queries.ts 참조)
 */
const RETRY = 2;

/** 홈은 목록이라 잠깐 캐시해도 안전하다. 탭 전환마다 재요청하면 체감이 나쁘다. */
const STALE_TIME = 1000 * 60;

/**
 * web `getDayBefore(n)` = `dayjs().add(-n,'day').startOf('day')` 와 동일.
 * dayjs 없이 처리한다(테스트 러너가 dayjs ESM 을 못 읽는다 —
 * frontend-test-runner-dayjs-esm-gap). 로컬(KST) 자정 기준인 것도 web 과 같다.
 *
 * ★ startOf('day') 라서 하루에 한 번만 값이 바뀐다 → queryKey 가 안정적이다.
 * 시각까지 들어가면 매 렌더 캐시 미스가 난다(querykey-time-granularity-trap).
 */
function getDayBeforeStartOfDay(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export class HomeQueries {
  static readonly keys = {
    all: ['home'] as const,
    tabSources: () => [...this.keys.all, 'tabSources'] as const,
    section: (sectionId: string, variables: unknown) =>
      [...this.keys.all, 'section', sectionId, variables] as const,
    recommendedKeywords: () =>
      [...this.keys.all, 'recommendedKeywords'] as const,
    tossLabels: () => [...this.keys.all, 'tossLabels'] as const,
    tossProducts: (label: string | null) =>
      [...this.keys.all, 'tossProducts', label ?? 'all'] as const,
    activeAds: (slotLocation: string) =>
      [...this.keys.all, 'activeAds', slotLocation] as const,
    ranking: () => [...this.keys.all, 'ranking'] as const,
  };

  /**
   * GRID_TABBED 의 탭 목록 두 개를 한 번에 받는다.
   * web 은 Promise.allSettled 로 실패를 삼키고 폴백 탭을 쓴다 — 같은 동작을 유지한다.
   * (하나가 죽어도 홈 전체가 죽으면 안 된다)
   */
  static tabSources() {
    return queryOptions({
      queryKey: this.keys.tabSources(),
      queryFn: async () => {
        const [providers, malls] = await Promise.allSettled([
          HomeService.getCommunityProviders(),
          HomeService.getMallGroups(),
        ]);
        return {
          communityProviders:
            providers.status === 'fulfilled' ? providers.value : [],
          mallGroups: malls.status === 'fulfilled' ? malls.value : [],
        };
      },
      retry: RETRY,
      staleTime: STALE_TIME,
    });
  }

  /**
   * 섹션 하나의 상품 목록.
   *
   * ★ queryName 과 응답 필드명이 항상 같지는 않다는 web 의 주석은 여기서도 유효하다 —
   * 응답에서 꺼낼 때 queryName 을 키로 쓴다(selectPromotionProducts 와 동일).
   */
  static section(section: ContentPromotionSection, extraVariables?: object) {
    const variables = {...section.dataSource.variables, ...extraVariables};
    return queryOptions({
      queryKey: this.keys.section(section.id, variables),
      queryFn: () => fetchSectionProducts(section, variables),
      retry: RETRY,
      staleTime: STALE_TIME,
    });
  }

  static recommendedKeywords() {
    return queryOptions({
      queryKey: this.keys.recommendedKeywords(),
      queryFn: async () => {
        return HomeService.getRecommendedKeywords();
      },
      retry: RETRY,
      staleTime: STALE_TIME,
    });
  }

  static tossLabels() {
    return queryOptions({
      queryKey: this.keys.tossLabels(),
      queryFn: async () => {
        return HomeService.getTossCategoryLabels();
      },
      retry: RETRY,
      staleTime: STALE_TIME,
    });
  }

  /**
   * 토스 섹션별 딜.
   * 섹션 id 를 서버 keyword 로 바꿔 조회한다(web toss.api.ts 와 같은 매핑).
   */
  static tossSectionProducts(
    sectionId: string,
    tossCategoryLabel: string | null,
    limit = 6,
  ) {
    const keyword = TOSS_SECTION_KEYWORD[sectionId] ?? TOSS_SECTION_KEYWORD.all;
    return queryOptions({
      queryKey: [
        ...this.keys.tossProducts(tossCategoryLabel),
        sectionId,
        limit,
      ],
      queryFn: () =>
        HomeService.getTossProducts({
          limit,
          keyword,
          orderBy: 'POSTED_AT' as never,
          orderOption: 'DESC' as never,
          tossCategoryLabel,
        }),
      retry: RETRY,
      staleTime: STALE_TIME,
    });
  }

  /**
   * 지름알림 랭킹 슬라이더.
   * web mobile/JirumRankingContainer 와 동일 변수 —
   * limit 10 · COMMUNITY_RANKING · 3일 전부터 · isEnd:false.
   *
   * ⚠️ startDate 를 매 렌더 새로 만들면 queryKey 가 계속 바뀌어 캐시가 죽는다
   * (querykey-time-granularity-trap). 날짜 단위로 끊어서 하루에 한 번만 바뀌게 한다.
   */
  static ranking() {
    const startDate = getDayBeforeStartOfDay(3);
    return queryOptions({
      queryKey: [...this.keys.ranking(), startDate],
      queryFn: () =>
        HomeService.getProducts({
          limit: 10,
          orderBy: 'COMMUNITY_RANKING' as never,
          orderOption: 'DESC' as never,
          startDate,
          isEnd: false,
        }) as Promise<ProductCardType[]>,
      retry: RETRY,
      staleTime: STALE_TIME,
    });
  }

  static activeAds(slotLocation: AdvertiseSlotLocation) {
    return queryOptions({
      queryKey: this.keys.activeAds(slotLocation),
      queryFn: async () => {
        return HomeService.getActiveAds({slotLocation});
      },
      retry: RETRY,
      staleTime: STALE_TIME,
    });
  }
}

/**
 * queryName → 실제 쿼리 디스패치.
 * web: apps/web/src/entities/promotion/lib/getPromotionQueryOptions.ts
 *
 * 알 수 없는 queryName 은 web 과 동일하게 throw 한다 — 조용히 빈 배열을 주면
 * 섹션이 이유 없이 사라져서 원인 추적이 어려워진다.
 */
async function fetchSectionProducts(
  section: ContentPromotionSection,
  variables: Record<string, unknown>,
): Promise<ProductCardType[]> {
  const {queryName} = section.dataSource;

  switch (queryName) {
    case 'hotDealRankingProducts': {
      return (await HomeService.getHotDealRankingProducts(
        variables as never,
      )) as ProductCardType[];
    }
    case 'guestRecommendedHotDeals': {
      return (await HomeService.getGuestRecommendedHotDeals(
        variables as never,
      )) as ProductCardType[];
    }
    case 'productsByKeyword': {
      return (await HomeService.getProductsByKeyword(
        variables as never,
      )) as ProductCardType[];
    }
    case 'products': {
      return (await HomeService.getProducts(
        variables as never,
      )) as ProductCardType[];
    }
    case 'expiringSoonHotDealProducts': {
      return (await HomeService.getExpiringSoonHotDealProducts(
        variables as never,
      )) as ProductCardType[];
    }
    default: {
      const exhaustive: never = queryName;
      throw new Error(`Unknown query name: ${String(exhaustive)}`);
    }
  }
}

/**
 * 큐레이션(더보기) 화면용 무한 목록.
 *
 * web CurationProductList 와 같은 구조 — queryName 5종 중 **3종만** 커서
 * 페이지네이션을 지원한다(`searchAfter`). hotDealRankingProducts 와
 * guestRecommendedHotDeals 는 page 인자를 받지만 web 도 단일 조회로 쓰므로
 * 그대로 맞춘다(더 불러올 커서가 없다).
 */
export function curationInfiniteQuery(section: ContentPromotionSection) {
  const variables = {
    ...section.dataSource.variables,
    limit: CURATION_LIMIT,
  };

  return infiniteQueryOptions({
    queryKey: [...HomeQueries.keys.all, 'curation', section.id, variables],
    initialPageParam: null as string[] | null,
    queryFn: ({pageParam}) =>
      fetchSectionProducts(section, {
        ...variables,
        searchAfter: pageParam,
      }),
    // web: lastPage.at(-1)?.searchAfter?.[0] — 마지막 행의 커서를 다음 시작점으로.
    // 배열째 넘긴다(스키마가 [String!] 를 받는다).
    getNextPageParam: (lastPage: ProductCardType[]) => {
      if (lastPage.length < CURATION_LIMIT) return undefined;
      const cursor = (lastPage.at(-1) as {searchAfter?: string[]} | undefined)
        ?.searchAfter;
      return cursor && cursor.length > 0 ? cursor : undefined;
    },
    retry: RETRY,
    staleTime: STALE_TIME,
  });
}

/** 커서를 지원하지 않는 섹션(랭킹·취향저격)의 단일 조회. */
export function curationSingleQuery(section: ContentPromotionSection) {
  const variables = {
    ...section.dataSource.variables,
    limit: CURATION_LIMIT,
  };
  return queryOptions({
    queryKey: [
      ...HomeQueries.keys.all,
      'curation-single',
      section.id,
      variables,
    ],
    queryFn: () => fetchSectionProducts(section, variables),
    retry: RETRY,
    staleTime: STALE_TIME,
  });
}

/**
 * 토스 특가 더보기 — 섹션별 무한 목록.
 *
 * 큐레이션(curationInfiniteQuery)과 같은 커서 방식이지만 응답이
 * `productsByKeyword` 전용이고 `data.toss` 확장정보를 담아야 하므로 따로 둔다.
 * (카드가 다르다 — curation-toss-theme-are-not-interchangeable)
 */
export function tossInfiniteQuery(
  sectionId: string,
  tossCategoryLabel: string | null,
) {
  const keyword = TOSS_SECTION_KEYWORD[sectionId] ?? TOSS_SECTION_KEYWORD.all;

  return infiniteQueryOptions({
    queryKey: [
      ...HomeQueries.keys.all,
      'toss-curation',
      sectionId,
      tossCategoryLabel ?? 'all',
    ],
    initialPageParam: null as string[] | null,
    queryFn: ({pageParam}) =>
      HomeService.getTossProducts({
        limit: CURATION_LIMIT,
        keyword,
        orderBy: 'POSTED_AT' as never,
        orderOption: 'DESC' as never,
        tossCategoryLabel,
        searchAfter: pageParam,
      }),
    getNextPageParam: lastPage => {
      if (lastPage.length < CURATION_LIMIT) return undefined;
      const cursor = (lastPage.at(-1) as {searchAfter?: string[]} | undefined)
        ?.searchAfter;
      return cursor && cursor.length > 0 ? cursor : undefined;
    },
    retry: RETRY,
    staleTime: STALE_TIME,
  });
}
