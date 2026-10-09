import {useEffect, useRef} from 'react';
import CookieManager from '@react-native-cookies/cookies';
import {Platform} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';

import {AuthQueries} from '@/entities/auth';
import {UserQueries} from '@/entities/user/user.queries';
import {StorageKey} from '@/shared/constant/storage-key';
import {useAuth} from '@/shared/hooks/useAuth';
import {setGuest} from '@/shared/lib/auth/guest';
import {showToast} from '@/shared/lib/feedback';
import {removeAsyncStorage} from '@/shared/lib/persistence';
import {
  savePendingAction,
  takePendingAction,
} from '@/shared/lib/pending-action';

/**
 * 로그인이 필요한 액션의 게이트.
 *
 * me() 로딩 중을 비로그인으로 보면 이미 들어온 사람이 토스트만 보고 막힌다.
 * 토큰 기준(useAuth)으로 보고, 정말 비로그인이면 의도를 저장해 복귀 후 이어간다.
 */
export function useRequireLogin(returnPath?: string) {
  const {isMember, isGuest, isLoading} = useAuth();
  const queryClient = useQueryClient();

  const requireLogin = (type: string, payload?: unknown) => {
    if (isLoading) return true;
    if (isMember) return false;
    savePendingAction(type, payload, returnPath).catch(() => {});
    if (isGuest) {
      // 게스트는 메인 안에 있어서 로그인 화면이 안 보인다 → 게스트 세션만 내려 로그인 화면으로.
      // 푸시 토큰은 떼지 않는다 — 로그인하면 백엔드가 기기 기준으로 키워드·토큰을 계정에 합치고,
      // 그냥 돌아와 다시 둘러보면 같은 게스트를 받는다.
      showToast.info('로그인하면 이어서 할 수 있어요.');
      void leaveGuestSession(queryClient);
    } else {
      showToast.info('로그인 후 이용해주세요.');
    }
    return true;
  };

  return {requireLogin, isLogin: isMember};
}

/** 게스트가 직접 「로그인」을 누를 때(내정보) — 게스트 세션만 내려 로그인 화면으로. */
export function useLeaveGuestSession() {
  const queryClient = useQueryClient();
  return () => leaveGuestSession(queryClient);
}

async function leaveGuestSession(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await removeAsyncStorage(StorageKey.ACCESS_TOKEN).catch(() => {});
  await removeAsyncStorage(StorageKey.REFRESH_TOKEN).catch(() => {});
  await setGuest(false).catch(() => {});
  await CookieManager.clearAll().catch(() => {});
  if (Platform.OS === 'ios') await CookieManager.clearAll(true).catch(() => {});
  queryClient.removeQueries({queryKey: UserQueries.keys.all});
  // useAuth 가 거절을 보고 RootNavigator 가 로그인 화면으로 바꾼다(useLogout 과 같은 길).
  await queryClient
    .invalidateQueries({queryKey: AuthQueries.keys.loginByRefreshToken()})
    .catch(() => {});
}

/**
 * 로그인하고 돌아왔을 때, 같은 type 의 동작을 한 번만 이어서 실행한다.
 */
export function usePendingAction<T = unknown>(
  type: string,
  run: (payload: T) => void,
  enabled = true,
) {
  // 회원일 때만 — 게스트로 다시 둘러보기 시작했다고 찜·댓글 같은 회원 동작을 실행하면 서버가 거절한다.
  const {isMember: isLogin, isLoading} = useAuth();
  const runRef = useRef(run);
  runRef.current = run;
  const consumed = useRef(false);

  useEffect(() => {
    if (isLoading || !isLogin || !enabled || consumed.current) return;

    takePendingAction(type)
      .then(action => {
        if (!action) return;
        consumed.current = true;
        runRef.current(action.payload as T);
      })
      .catch(() => {});
  }, [isLogin, isLoading, type, enabled]);
}
