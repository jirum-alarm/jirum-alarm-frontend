import {useSyncExternalStore} from 'react';

import {
  NO_SNAPSHOT,
  getAlarmUnreadSnapshot,
  subscribeAlarmUnreadSnapshot,
} from '@/shared/lib/alarm-unread-snapshot';
import {useUnreadNotifications} from '@/shared/hooks/useUnreadNotifications';

/**
 * 탭바 알림 점 판정. **네이티브가 소유한다.**
 *
 * 예전엔 값을 밖에서 밀어넣는 수동 store 였고(`setHasNewAlarm`), 유일한 호출자가
 * 웹뷰 브릿지(`ALARM_DOT_CHANGED`)였다. 그런데 그 메시지를 보내던 web
 * `BottomNav` 는 앱에서 `isJirumAlarmApp` 조기 반환에 걸려 렌더 자체가 안 된다 →
 * 브릿지가 앱에 **한 번도 오지 않아 점이 영구히 꺼져 있었다**. 그래서 판정을
 * 미읽음 수 + 스냅샷으로 여기서 직접 계산한다(브릿지 의존 제거).
 */
export function decideHasNewAlarm(unreadCount: number, snapshot: number) {
  // 스냅샷이 없다 = 알림함을 아직 한 번도 안 봤다 → 미읽음이 있으면 켠다.
  if (snapshot === NO_SNAPSHOT) return unreadCount > 0;
  // 본 뒤로 늘었을 때만 켠다 — 안 읽고 남겨둔 알림은 점을 붙잡아 두지 않는다.
  return unreadCount > snapshot;
}

export function useHasNewAlarm() {
  const unreadCount = useUnreadNotifications();
  const snapshot = useSyncExternalStore(
    subscribeAlarmUnreadSnapshot,
    getAlarmUnreadSnapshot,
  );

  return decideHasNewAlarm(unreadCount, snapshot);
}
