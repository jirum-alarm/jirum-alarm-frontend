import { AuthService } from '@/shared/api/auth';
import { QueryMypageKeywordQueryVariables } from '@/shared/api/gql/graphql';
import { queryOptions } from '@tanstack/react-query';

export const authQueries = {
  all: () => ['auth'],
  me: () =>
    queryOptions({
      queryKey: [...authQueries.all(), 'me'],
      queryFn: () => AuthService.getMe(),
    }),

  myKeyword: (variables: QueryMypageKeywordQueryVariables) =>
    queryOptions({
      queryKey: [
        ...authQueries.all(),
        'keyword',
        { limit: variables.limit, searchAfter: variables.searchAfter },
      ],
      queryFn: () => AuthService.getMyKeyword(variables),
    }),
};
