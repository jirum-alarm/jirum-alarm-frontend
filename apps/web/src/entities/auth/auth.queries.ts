import { queryOptions } from '@tanstack/react-query';

import { AuthService } from '@/shared/api/auth';
import { graphql } from '@/shared/api/gql';
import { QueryMypageKeywordQueryVariables } from '@/shared/api/gql/graphql';

export const AuthQueries = {
  all: () => ['auth'],
  me: () =>
    queryOptions({
      queryKey: [...AuthQueries.all(), 'me'],
      queryFn: () => AuthService.getMe(),
    }),
  meServer: () =>
    queryOptions({
      queryKey: [...AuthQueries.all(), 'me'],
      queryFn: () => AuthService.getMeServer(),
    }),
  keyword: () => [...AuthQueries.all(), 'keyword'],
  myKeywords: (variables: QueryMypageKeywordQueryVariables) =>
    queryOptions({
      queryKey: [
        ...AuthQueries.keyword(),
        { limit: variables.limit, searchAfter: variables.searchAfter },
      ],
      queryFn: () => AuthService.getMyKeyword(variables),
    }),
};
