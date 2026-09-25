import {useQuery} from '@tanstack/react-query';
import {useEffect, useState} from 'react';
import {removeAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';
import {StorageKey} from '@/shared/constant/storage-key.ts';
import CookieManager from '@react-native-cookies/cookies';
import {SERVICE_URL} from '@/constants/env.ts';
import {AuthQueries} from '@/entities/auth';
import {isAuthFailure} from '@/shared/lib/client';

export const useAuth = () => {
  const {data, error, isLoading, isSuccess, isError} = useQuery(
    AuthQueries.loginByRefreshToken(),
  );
  /**
   * 🔴로그아웃은 **서버가 토큰을 거절했을 때만**. 예전엔 isError 면 무조건 토큰을
   * 지웠는데, 이 쿼리는 주기적으로·재연결 때마다 다시 돈다 — 지하철에서 한 번
   * 튄 네트워크 오류가 로그아웃이 됐다(안드로이드 에뮬레이터 실측 2026-09-25:
   * 맥 네트워크가 끊긴 사이 로그인 화면으로 튕김). 네트워크 실패면 토큰을 두고,
   * 이미 받아둔 data 로 로그인 상태를 유지한다(react-query 는 refetch 실패에도
   * 직전 data 를 남긴다). 재연결되면 refetchOnReconnect 가 다시 확인한다.
   */
  const isRejected = isError && isAuthFailure(error);
  const [isCookieReady, setIsCookieReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (isSuccess && data) {
        const {accessToken, refreshToken} = data.loginByRefreshToken;
        await setAsyncStorage(StorageKey.ACCESS_TOKEN, accessToken);
        await setAsyncStorage(StorageKey.REFRESH_TOKEN, refreshToken);

        await CookieManager.set(SERVICE_URL, {
          name: 'ACCESS_TOKEN',
          value: accessToken,
        });
        if (refreshToken) {
          await CookieManager.set(SERVICE_URL, {
            name: 'REFRESH_TOKEN',
            value: refreshToken,
          });
        }
        setIsCookieReady(true);
      }
    })();
  }, [isSuccess, data]);

  useEffect(() => {
    (async () => {
      if (isRejected) {
        await removeAsyncStorage(StorageKey.ACCESS_TOKEN);
        await removeAsyncStorage(StorageKey.REFRESH_TOKEN);
        setIsCookieReady(false);
      }
    })();
  }, [isRejected]);

  return {isLogin: !!data && isCookieReady && !isRejected, isLoading};
};
