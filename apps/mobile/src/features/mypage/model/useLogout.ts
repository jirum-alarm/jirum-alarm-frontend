import {useCallback} from 'react';
import {Platform} from 'react-native';
import CookieManager from '@react-native-cookies/cookies';
import * as Notifications from 'expo-notifications';
import {useQueryClient} from '@tanstack/react-query';

import {AuthQueries} from '@/entities/auth';
import {MyPageQueries} from '@/entities/mypage';
import {ThemeQueries} from '@/entities/theme';
import {StorageKey} from '@/shared/constant/storage-key';
import {removeAsyncStorage} from '@/shared/lib/persistence';
import {setUnreadCount} from '@/shared/hooks/useUnreadNotifications';

/**
 * 로그아웃. **웹뷰가 대신 해주던 일을 이 화면이 인수한 자리다.**
 *
 * 웹뷰 시절 경로:
 *   web `useLogout` → 자기 쿠키 삭제 → `TOKEN_REMOVE` 브릿지
 *   → `AuthBridge.tokenRemove` → `useTokenRemoveEffect`(웹뷰 화면에 붙어 있음)
 *     → AsyncStorage 토큰 삭제 + `loginByRefreshToken` 무효화
 *   → web 이 `window.location.replace('/')`
 *
 * 내정보가 네이티브가 되면 그 브릿지가 아예 오지 않는다. 그런데
 * `useTokenRemoveEffect` 는 **웹뷰 화면에만** 걸려 있어서, 네이티브 버튼이
 * `TOKEN_REMOVE` 를 흉내내 쏴도 그 화면이 살아 있지 않으면 아무 일도 안 난다.
 * 그래서 여기서 **직접** 한다:
 *
 *   1) AsyncStorage 의 access/refresh 토큰 삭제
 *   2) 쿠키 삭제 — `useAuth` 가 WebView 용으로 심어둔 ACCESS_TOKEN/REFRESH_TOKEN.
 *      안 지우면 커뮤니티 탭 웹뷰가 계속 로그인 상태로 보인다.
 *   3) `loginByRefreshToken` 무효화 → `useAuth.isError` → `RootNavigator` 가
 *      `AuthNavigator` 로 바꾼다. web 의 `location.replace('/')` 대응이며,
 *      **화면 이동을 직접 하지 않는 이유**가 이것이다(로그인 게이트가 루트에 있다).
 *   4) 배지·미읽음 수 0 — web 엔 없던 처리다. 앱 아이콘 배지는 OS 에 남으므로
 *      로그아웃해도 숫자가 그대로 뜬다(알림 탭 배지 버그와 같은 뿌리).
 *
 * ★모든 정리는 실패해도 다음 단계를 막지 않는다. 토큰만 남으면 로그아웃이
 * 통째로 안 된 것처럼 보이므로 무효화(3)는 어떤 경우에도 실행한다.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await removeAsyncStorage(StorageKey.ACCESS_TOKEN).catch(() => {});
    await removeAsyncStorage(StorageKey.REFRESH_TOKEN).catch(() => {});

    // ★iOS 는 쿠키 저장소가 두 벌이다(NSHTTPCookieStorage / WKWebsiteDataStore).
    // `useAuth` 는 기본(useWebKit=false)으로 심으므로 그쪽을 반드시 지우고,
    // WKWebView 쪽도 같이 비운다 — 한쪽만 지우면 웹뷰가 로그인 상태로 남는다.
    await CookieManager.clearAll().catch(() => {});
    if (Platform.OS === 'ios') {
      await CookieManager.clearAll(true).catch(() => {});
    }

    setUnreadCount(0);
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(0).catch(() => {});
    }

    // 다음 유저에게 이전 유저 데이터가 한 프레임 보이지 않게 개인 캐시를 버린다.
    // ★`queryClient.clear()` 를 쓰지 않는다 — 아래 무효화 대상(auth)까지 지워
    // 재조회가 두 번 도는 데다, 어느 쪽이 먼저 끝나는지가 순서에 좌우된다.
    queryClient.removeQueries({queryKey: MyPageQueries.keys.all});
    queryClient.removeQueries({queryKey: ThemeQueries.keys.all});

    await queryClient
      .invalidateQueries({queryKey: AuthQueries.keys.loginByRefreshToken()})
      .catch(() => {});
  }, [queryClient]);
}
