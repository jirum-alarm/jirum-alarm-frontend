import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { CommentService } from '@/shared/api/comment';
import { CommentOrder, CommentsQueryVariables, OrderOptionType } from '@/shared/api/gql/graphql';

const COMMENTS_LIMIT = 10;
const COMMENTS_ORDER_BY = CommentOrder.Id;
const COMMENTS_ORDER_OPTION = OrderOptionType.Desc;

export const defaultCommentsVariables = {
  limit: COMMENTS_LIMIT,
  orderBy: COMMENTS_ORDER_BY,
  orderOption: COMMENTS_ORDER_OPTION,
};

export const CommentQueries = {
  all: () => ['comments'],

  comments: (variables: CommentsQueryVariables) =>
    queryOptions({
      queryKey: [
        ...CommentQueries.all(),
        {
          productId: variables.productId,
          searchAfter: variables.searchAfter,
          limit: variables.limit,
          orderBy: variables.orderBy,
          orderOption: variables.orderOption,
        },
      ],
      queryFn: () => CommentService.getComments(variables),
    }),

  infiniteComments: (variables: CommentsQueryVariables) =>
    infiniteQueryOptions({
      queryKey: [...CommentQueries.comments(variables).queryKey],
      queryFn: ({ pageParam }) =>
        CommentService.getComments({ ...variables, searchAfter: pageParam }),
      initialPageParam: null as null | string[],
      getNextPageParam: (lastPage) => {
        return lastPage.comments.at(-1)?.searchAfter;
      },
    }),
};
