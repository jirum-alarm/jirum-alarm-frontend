import {queryOptions} from '@tanstack/react-query';
import {AuthService} from '@/shared/api/auth/auth.service.ts';
import {isAuthFailure} from '@/shared/lib/client';

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
      // 전역 retry:false 를 여기서만 되살린다. 토큰 갱신 한 번의 네트워크 실패가
      // 곧 로그아웃이 되면 안 된다. 서버가 토큰을 거절한 것(401/403)은 다시 해도 같다.
      retry: (failureCount, error) => !isAuthFailure(error) && failureCount < 3,
    });
  }
}
