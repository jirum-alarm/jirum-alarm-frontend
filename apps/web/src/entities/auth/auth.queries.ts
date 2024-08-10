import { AuthService } from '@/shared/api/auth';
import { QueryMypageKeywordQueryVariables } from '@/shared/api/gql/graphql';
import { queryOptions } from '@tanstack/react-query';

export const AuthQueries = {
  all: () => ['auth'],
  me: () =>
    queryOptions({
      queryKey: [...AuthQueries.all(), 'me'],
      queryFn: () => AuthService.getMe(),
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
