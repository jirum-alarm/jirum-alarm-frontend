import {queryOptions} from '@tanstack/react-query';
import {AuthService} from '@/shared/api/auth/auth.service.ts';

const ACCESS_TOKEN_REFRESH_TIME = 1000 * 60 * 60 - 1000 * 60 * 3; // 60분 - 3분

export class AuthQueries {
  static readonly keys = {
    all: ['auth'],
    loginByRefreshToken: () => [...this.keys.all, 'loginByRefreshToken'],
  };

  static loginByRefreshToken() {
    return queryOptions({
      queryKey: [...this.keys.loginByRefreshToken()],
      queryFn: AuthService.loginByRefreshToken,
      staleTime: ACCESS_TOKEN_REFRESH_TIME,
      refetchInterval: ACCESS_TOKEN_REFRESH_TIME,
      refetchOnReconnect: true,
      refetchIntervalInBackground: true,
    });
  }
}
