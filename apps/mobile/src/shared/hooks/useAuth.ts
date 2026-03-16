import {useQuery} from '@tanstack/react-query';
import {useEffect, useState} from 'react';
import {removeAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';
import {StorageKey} from '@/shared/constant/storage-key.ts';
import CookieManager from '@react-native-cookies/cookies';
import {SERVICE_URL} from '@/constants/env.ts';
import {AuthQueries} from '@/entities/auth';

export const useAuth = () => {
  const {data, isLoading, isSuccess, isError} = useQuery(
    AuthQueries.loginByRefreshToken(),
  );
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
      if (isError) {
        await removeAsyncStorage(StorageKey.ACCESS_TOKEN);
        await removeAsyncStorage(StorageKey.REFRESH_TOKEN);
        setIsCookieReady(false);
      }
    })();
  }, [isError]);

  return {isLogin: isSuccess && isCookieReady, isLoading};
};
