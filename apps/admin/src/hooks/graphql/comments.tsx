import { useQuery } from '@apollo/client/react';

import { CommentsByAdminQuery, CommentsByAdminQueryVariables } from '@/generated/gql/graphql';
import { QueryCommentsByAdmin } from '@/graphql/comments';

import { QueryOptions } from './options';

export const useGetComments = (
  queryOptions: QueryOptions<CommentsByAdminQuery, CommentsByAdminQueryVariables>,
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
