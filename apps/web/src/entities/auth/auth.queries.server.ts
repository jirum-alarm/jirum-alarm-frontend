import { queryOptions } from '@tanstack/react-query';

import { AuthService } from '@/shared/api/auth';

export const AuthQueriesServer = {
  all: () => ['auth'],
  me: () =>
    queryOptions({
      queryKey: [...AuthQueriesServer.all(), 'me'],
      queryFn: () => AuthService.getMeServer(),
    }),
};
