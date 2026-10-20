import {
  COMMUNITY_POSTS_ORDER,
  COMMUNITY_POSTS_PAGE_SIZE,
  type CommunityTab,
  communityTabFilter,
} from '@jirum/domain/community';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { CommunityService } from '@/shared/api/community/community.service';
import { CommentOrder, OrderOptionType } from '@/shared/api/gql/graphql';

const COMMENTS_LIMIT = 20;

// 쪽 크기·정렬·탭 필터는 정본 @jirum/domain/community(앱 목록과 같은 값).
export const defaultPostsVariables = {
  limit: COMMUNITY_POSTS_PAGE_SIZE,
  orderBy: COMMUNITY_POSTS_ORDER.orderBy as CommentOrder,
  orderOption: COMMUNITY_POSTS_ORDER.orderOption as OrderOptionType,
};

export type { CommunityTab };

export const CommunityQueries = {
  all: () => ['community'] as const,

  posts: (tab: CommunityTab) =>
    infiniteQueryOptions({
      queryKey: [...CommunityQueries.all(), 'posts', tab],
      queryFn: ({ pageParam }) =>
        CommunityService.getCommunityPosts({
          ...defaultPostsVariables,
          ...communityTabFilter(tab),
          searchAfter: pageParam,
        }),
      initialPageParam: null as null | string[],
      getNextPageParam: (lastPage) => {
        return lastPage.comments.at(-1)?.searchAfter ?? null;
      },
    }),

  post: (id: number) =>
    queryOptions({
      queryKey: [...CommunityQueries.all(), 'post', id],
      queryFn: () => CommunityService.getCommunityPost(id),
    }),

  comments: (postId: number) =>
    infiniteQueryOptions({
      queryKey: [...CommunityQueries.all(), 'comments', postId],
      queryFn: ({ pageParam }) =>
        CommunityService.getCommunityComments({
          parentId: postId,
          limit: COMMENTS_LIMIT,
          orderBy: CommentOrder.Id,
          orderOption: OrderOptionType.Desc,
          searchAfter: pageParam,
        }),
      initialPageParam: null as null | string[],
      getNextPageParam: (lastPage) => lastPage?.comments.at(-1)?.searchAfter ?? null,
    }),
};
