import { queryOptions } from '@tanstack/react-query';

import { AuthService } from '@/shared/api/auth';
import { QueryMypageKeywordQueryVariables } from '@/shared/api/gql/graphql';

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
  recommendedKeywords: () =>
    queryOptions({
      queryKey: [...AuthQueries.all(), 'recommended-keywords'],
      queryFn: () => AuthService.getRecommendedKeywords(),
      // 배치(1일 1회)가 만드는 값이라 재요청은 아껴도 되지만, staleTime 을 길게 잡으면
      // 배치가 품질을 고친 뒤에도 열어둔 탭이 옛 추천을 계속 보여준다(실제로 겪음).
      // 1분이면 재요청 부담은 사실상 없고 갱신은 바로 따라온다.
      staleTime: 1000 * 60,
    }),
};
