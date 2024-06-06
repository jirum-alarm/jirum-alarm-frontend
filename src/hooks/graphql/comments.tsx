import { QueryCommentsByAdmin } from '@/graphql/comments';
import { QueryHookOptions, useQuery } from '@apollo/client';

interface GetCommentsData {
  commentsByAdmin: string[];
}

interface GetCommentsVariables {
  hotDealKeywordId: number;
  synonyms?: string[];
  excludes?: string[];
}

const useGetComments = (queryOptions: QueryHookOptions<any, GetCommentsVariables>) => {
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

export { useGetComments };
