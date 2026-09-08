import {infiniteQueryOptions, queryOptions} from '@tanstack/react-query';

import {CommentOrder, OrderOptionType} from '@/shared/api/gql/graphql';
import {CommunityService} from '@/shared/api/community';
import {HomeService} from '@/shared/api/home/home.service';
import type {ProductCardType} from '@/entities/home/model/types';

/** 커뮤니티 탭 3종. web `entities/community` 의 CommunityTab 과 같은 값. */
export type CommunityTab = 'all' | 'trending' | 'notice';

const POSTS_LIMIT = 20;
const COMMENTS_LIMIT = 20;

/**
 * web `defaultPostsVariables` 와 같은 정렬. 어긋나면 같은 커뮤니티가
 * 웹/앱에서 다른 순서로 보인다.
 */
export const defaultPostsVariables = {
  limit: POSTS_LIMIT,
  orderBy: CommentOrder.Id,
  orderOption: OrderOptionType.Desc,
} as const;

/** web `getTabFilter` 와 같은 매핑. '전체' 는 필터를 아예 안 보낸다. */
export function getTabFilter(tab: CommunityTab): {
  isNotice?: boolean;
  isTrending?: boolean;
} {
  if (tab === 'notice') return {isNotice: true};
  if (tab === 'trending') return {isTrending: true};
  return {};
}

/**
 * ReactQueryProvider 가 retry: false 를 전역으로 걸어둔 탓에 네트워크가 한 번
 * 튀면 목록이 즉시 에러가 된다(home·product 쿼리와 같은 처방).
 */
const RETRY = 2;

/**
 * web `getDayBefore(n)` = `dayjs().add(-n,'day').startOf('day')`.
 * dayjs 는 테스트 러너가 ESM 을 못 읽어 쓰지 않는다(home.queries 와 같은 이유).
 * 자정 기준이라 queryKey 가 하루에 한 번만 바뀐다.
 */
function getDayBeforeStartOfDay(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export class CommunityQueries {
  static readonly keys = {
    all: ['community'] as const,
    posts: (tab: CommunityTab) => [...this.keys.all, 'posts', tab] as const,
    post: (id: number) => [...this.keys.all, 'post', id] as const,
    comments: (postId: number) =>
      [...this.keys.all, 'comments', postId] as const,
    hotDeals: (optionId: string) =>
      [...this.keys.all, 'hotDeals', optionId] as const,
  };

  /**
   * 탭별 글 목록. 커서는 마지막 행의 searchAfter 를 그대로 넘긴다(web 과 같은 규약).
   *
   * ⚠️ `searchAfter` 만 보고 다음 페이지를 요청하면 마지막 페이지에서 빈 응답을
   * 무한히 조른다. limit 미달이면 끝으로 본다(comment.queries 와 같은 처방).
   */
  static posts(tab: CommunityTab) {
    return infiniteQueryOptions({
      queryKey: this.keys.posts(tab),
      queryFn: ({pageParam}) =>
        CommunityService.getPosts({
          ...defaultPostsVariables,
          ...getTabFilter(tab),
          searchAfter: pageParam,
        }),
      initialPageParam: null as null | string[],
      getNextPageParam: lastPage => {
        const last = lastPage.at(-1);
        if (!last || lastPage.length < POSTS_LIMIT) return null;
        return last.searchAfter ?? null;
      },
      retry: RETRY,
    });
  }

  static post(id: number) {
    return queryOptions({
      queryKey: this.keys.post(id),
      queryFn: () => CommunityService.getPost(id),
      retry: RETRY,
    });
  }

  static comments(postId: number) {
    return infiniteQueryOptions({
      queryKey: this.keys.comments(postId),
      queryFn: ({pageParam}) =>
        CommunityService.getPostComments({
          parentId: postId,
          limit: COMMENTS_LIMIT,
          orderBy: CommentOrder.Id,
          orderOption: OrderOptionType.Desc,
          searchAfter: pageParam,
        }),
      initialPageParam: null as null | string[],
      getNextPageParam: lastPage => {
        const last = lastPage.at(-1);
        if (!last || lastPage.length < COMMENTS_LIMIT) return null;
        return last.searchAfter ?? null;
      },
      retry: RETRY,
    });
  }

  /**
   * 목록 아래 붙는 핫딜/랭킹 6개. web `CommunityHotDeals` 와 같은 변수.
   *
   * ★쿼리를 새로 만들지 않는다 — `HomeService` 의 것을 그대로 쓴다.
   * 카테고리 필터는 `categoryIds`(배열)다. web 은 `categoryId` 단일 인자를
   * 쓰지만 앱 스키마 문서는 배열이라, 단일 값을 배열로 감싼다.
   */
  static hotDeals(option: {
    id: string;
    type: 'hotdeal' | 'ranking';
    categoryId: number | null;
  }) {
    const startDate = getDayBeforeStartOfDay(3);
    return queryOptions({
      queryKey: [...this.keys.hotDeals(option.id), startDate],
      queryFn: () =>
        option.type === 'hotdeal'
          ? (HomeService.getHotDealRankingProducts({
              page: 0,
              limit: 6,
            }) as Promise<ProductCardType[]>)
          : (HomeService.getProducts({
              limit: 6,
              orderBy: 'COMMUNITY_RANKING' as never,
              orderOption: 'DESC' as never,
              startDate,
              isEnd: false,
              // '전체' 는 필터 없음. 0 이나 null 을 배열로 감싸 보내면 실제
              // 카테고리로 취급돼 결과가 항상 빈다.
              ...(option.categoryId != null
                ? {categoryIds: [option.categoryId]}
                : {}),
            }) as Promise<ProductCardType[]>),
      retry: RETRY,
      staleTime: 1000 * 60,
    });
  }
}
