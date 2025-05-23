import { QueryHookOptions, useQuery } from '@apollo/client';

import { QueryCommentsByAdmin } from '@/graphql/comments';

interface GetCommentsData {
  commentsByAdmin: string[];
}

interface GetCommentsVariables {
  hotDealKeywordId: number;
  synonyms?: string[];
  excludes?: string[];
}

export const useGetComments = (queryOptions: QueryHookOptions<any, GetCommentsVariables>) => {
  const { variables, ...rest } = queryOptions;
  return useQuery<GetCommentsData, GetCommentsVariables>(QueryCommentsByAdmin, {
    ...rest,
    variables: {
      hotDealKeywordId: variables?.hotDealKeywordId ?? 1,
      synonyms: variables?.synonyms,
      excludes: variables?.excludes,
    },
  });
};
