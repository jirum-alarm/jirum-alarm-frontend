import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { CommunityService } from '@/shared/api/community/community.service';
import { CommentOrder, OrderOptionType } from '@/shared/api/gql/graphql';

const COMMENTS_LIMIT = 20;

const POSTS_LIMIT = 20;
const POSTS_ORDER_BY = CommentOrder.Id;
const POSTS_ORDER_OPTION = OrderOptionType.Desc;

export const defaultPostsVariables = {
  limit: POSTS_LIMIT,
  orderBy: POSTS_ORDER_BY,
  orderOption: POSTS_ORDER_OPTION,
};

export type CommunityTab = 'all' | 'trending' | 'notice';

function getTabFilter(tab: CommunityTab): { isNotice?: boolean; isTrending?: boolean } {
  if (tab === 'notice') return { isNotice: true };
  if (tab === 'trending') return { isTrending: true };
  return {};
}

export const CommunityQueries = {
  all: () => ['community'] as const,

  posts: (tab: CommunityTab) =>
    infiniteQueryOptions({
      queryKey: [...CommunityQueries.all(), 'posts', tab],
      queryFn: ({ pageParam }) =>
        CommunityService.getCommunityPosts({
          ...defaultPostsVariables,
          ...getTabFilter(tab),
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
