import { AuthService } from '@/shared/api/auth';
import { queryOptions } from '@tanstack/react-query';

export const AuthQueriesServer = {
  all: () => ['auth'],
  me: () =>
    queryOptions({
      queryKey: [...AuthQueriesServer.all(), 'me'],
      queryFn: () => AuthService.getMeServer(),
    }),
};
