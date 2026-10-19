import {useEffect, useRef} from 'react';
import {AppState, type AppStateStatus} from 'react-native';
import {useQuery, useQueryClient} from '@tanstack/react-query';

import {NotificationQueries} from '@/entities/notification';
import {setUnreadCount} from '@/shared/hooks/useUnreadNotifications';
import {hydrateAlarmUnreadSnapshot} from '@/shared/lib/alarm-unread-snapshot';

/**
 * 탭바 알림 점의 원료(미읽음 수)를 네이티브가 스스로 가져온다.
 *
 * 웹뷰 시절엔 web `BottomNav` 가 unreadCount 를 쿼리해 점 여부를 브릿지로
 * 올려줬다. 앱에서 그 컴포넌트가 렌더되지 않아 값이 안 왔으므로(useHasNewAlarm
 * 주석 참조) 여기서 직접 받는다.
 *
 * 마운트 위치는 `MainNavigator` — 로그인 상태에서만 렌더되므로(RootNavigator 가
 * 비로그인을 AuthNavigator 로 보낸다) 별도 `enabled: isLoggedIn` 가드가 필요 없다.
 */
export default function useAlarmDotSync() {
  const queryClient = useQueryClient();
  const {data: unreadCount} = useQuery(NotificationQueries.unreadCount());

  // 저장된 기준선을 메모리 store 로 끌어온다(앱 시작 1회).
  useEffect(() => {
    hydrateAlarmUnreadSnapshot();
  }, []);

  useEffect(() => {
    if (unreadCount !== undefined) setUnreadCount(unreadCount ?? 0);
  }, [unreadCount]);

  // 포그라운드 복귀 시 재조회. useAppStateTokenRefresh 와 같은 패턴이다
  // (staleTime/refetchOnWindowFocus 가 아니라 명시적 무효화가 이 레포 관행).
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        queryClient.invalidateQueries({
          queryKey: NotificationQueries.unreadCount().queryKey,
        });
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [queryClient]);
}
