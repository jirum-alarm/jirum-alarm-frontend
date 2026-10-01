import {useQuery} from '@tanstack/react-query';
import {useEffect, useSyncExternalStore} from 'react';
import {removeAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';
import {StorageKey} from '@/shared/constant/storage-key.ts';
import CookieManager from '@react-native-cookies/cookies';
import {SERVICE_URL} from '@/constants/env.ts';
import {AuthQueries} from '@/entities/auth';
import {isAuthFailure} from '@/shared/lib/client';

/**
 * 토큰·쿠키 동기화는 **앱 전체에서 토큰당 한 번**(모듈 단일 상태).
 *
 * 예전엔 useAuth 를 부르는 곳마다(상세 화면에만 ~9곳) 각자 AsyncStorage 2번·쿠키 2번을
 * 쓰고, 각자 isCookieReady=false 로 시작했다. 그래서 상세를 열 때마다 네이티브 호출이
 * 수십 번 몰리고, 그 사이 찜·추천을 누르면 로그인한 사람에게도 "로그인 후 이용해주세요" 가 떴다.
 * 이제 한 번 끝나면 이후에 마운트되는 화면은 처음부터 준비된 상태로 읽는다.
 *
 * ★한 번 준비되면 **서버가 토큰을 거절할 때까지** 내려가지 않는다 — 토큰 갱신(새 accessToken)
 * 마다 false 로 내리면 그 순간 isLogin 이 꺼져 RootNavigator 가 로그인 화면으로 튕긴다.
 */
let cookieReady = false;
let syncedToken: string | null = null;
let syncingToken: string | null = null;
const readyListeners = new Set<() => void>();

function emitReady() {
  readyListeners.forEach(listener => listener());
}

function subscribeReady(listener: () => void) {
  readyListeners.add(listener);
  return () => {
    readyListeners.delete(listener);
  };
}

const getCookieReady = () => cookieReady;

async function syncTokensOnce(
  accessToken: string,
  refreshToken?: string | null,
) {
  if (syncedToken === accessToken || syncingToken === accessToken) return;
  syncingToken = accessToken;
  // 🔴 여기서 하나라도 throw 하면 준비가 영원히 false 라 로그인 화면에 갇힌다
  // ("로그인 성공" 토스트만 뜨고 안 넘어감 — 1.4.6 심사 거절 2026-09-26, iPadOS 27).
  // 쿠키는 웹뷰 세션 동기화용이다 — 실패해도 네이티브 로그인은 막지 않는다.
  try {
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
  } catch (e) {
    console.warn('[useAuth] 토큰·쿠키 동기화 실패 — 로그인은 계속한다', e);
  } finally {
    syncingToken = null;
    syncedToken = accessToken;
    if (!cookieReady) {
      cookieReady = true;
      emitReady();
    }
  }
}

let clearing = false;
async function clearTokensOnce() {
  if (clearing) return;
  clearing = true;
  try {
    await removeAsyncStorage(StorageKey.ACCESS_TOKEN);
    await removeAsyncStorage(StorageKey.REFRESH_TOKEN);
  } finally {
    clearing = false;
    syncedToken = null;
    if (cookieReady) {
      cookieReady = false;
      emitReady();
    }
  }
}

/** 테스트용 — 모듈 상태를 처음으로 되돌린다. */
export function __resetAuthSyncForTest() {
  cookieReady = false;
  syncedToken = null;
  syncingToken = null;
  clearing = false;
}

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
  const isCookieReady = useSyncExternalStore(subscribeReady, getCookieReady);

  useEffect(() => {
    if (isSuccess && data) {
      const {accessToken, refreshToken} = data.loginByRefreshToken;
      void syncTokensOnce(accessToken, refreshToken);
    }
  }, [isSuccess, data]);

  useEffect(() => {
    if (isRejected) void clearTokensOnce();
  }, [isRejected]);

  return {isLogin: !!data && isCookieReady && !isRejected, isLoading};
};
