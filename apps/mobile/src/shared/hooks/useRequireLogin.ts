import {useEffect, useRef} from 'react';
import CookieManager from '@react-native-cookies/cookies';
import {Platform} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';

import {AuthQueries} from '@/entities/auth';
import {openLoginModal} from '@/navigations/navigation-ref';
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
    if (isGuest) {
      // 게스트는 지금 화면 위에 로그인 창을 띄운다 — 뒤 화면이 그대로라 로그인되면 이 화면의
      // usePendingAction 이 이어서 실행한다. 그래서 돌아갈 경로(returnPath)는 남기지 않는다(남기면
      // PendingLoginRestore 가 같은 화면을 하나 더 연다).
      // 창을 못 띄우면(메인이 아직 안 뜸) 예전처럼 게스트 세션을 내려 로그인 화면으로. 푸시 토큰은 떼지 않는다 —
      // 로그인하면 백엔드가 기기 기준으로 키워드·토큰을 계정에 합친다.
      if (openLoginModal()) {
        savePendingAction(type, payload).catch(() => {});
        return true;
      }
      savePendingAction(type, payload, returnPath).catch(() => {});
      showToast.info('로그인하면 이어서 할 수 있어요.');
      void leaveGuestSession(queryClient);
    } else {
      savePendingAction(type, payload, returnPath).catch(() => {});
      showToast.info('로그인 후 이용해주세요.');
    }
    return true;
  };

  /**
   * 알림(키워드) 등록 게이트 — 게스트도 통과한다. 게스트 계정은 "로그인 없이 알림 받기" 를 위해
   * 있는 것인데, 알림 받기에 requireLogin 을 쓰면 게스트를 로그인 화면으로 내쫓는다(2026-10-12 발견:
   * 구매 후 권유·홈 추천 칩). 세션이 아예 없을 때만 로그인으로 보낸다.
   */
  const requireAlertSession = (type: string, payload?: unknown) => {
    if (isLoading) return true;
    if (isMember || isGuest) return false;
    return requireLogin(type, payload);
  };

  return {requireLogin, requireAlertSession, isLogin: isMember};
}

/**
 * 게스트가 직접 「로그인」을 누를 때(내정보·댓글) — 지금 화면 위 로그인 창. 못 띄우면 게스트 세션을 내려 로그인 화면으로.
 */
export function useOpenLogin() {
  const queryClient = useQueryClient();
  return () => {
    if (openLoginModal()) return;
    void leaveGuestSession(queryClient);
  };
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
