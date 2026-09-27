import { QueryHookOptions, useQuery } from '@apollo/client';

import { CommentsByAdminQuery, CommentsByAdminQueryVariables } from '@/generated/gql/graphql';
import { QueryCommentsByAdmin } from '@/graphql/comments';

export const useGetComments = (
  queryOptions: QueryHookOptions<CommentsByAdminQuery, CommentsByAdminQueryVariables>,
) => {
  const { variables, ...rest } = queryOptions;
  return useQuery<CommentsByAdminQuery, CommentsByAdminQueryVariables>(QueryCommentsByAdmin, {
    ...rest,
    variables: {
      hotDealKeywordId: variables?.hotDealKeywordId ?? 1,
      synonyms: variables?.synonyms,
      excludes: variables?.excludes,
    },
  });
};
