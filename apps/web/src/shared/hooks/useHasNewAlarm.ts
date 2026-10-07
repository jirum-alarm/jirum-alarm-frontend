'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { PAGE } from '@/shared/config/page';
import useIsLoggedIn from '@/shared/hooks/useIsLoggedIn';
import { getUnreadCountAfterLastRead, setUnreadCountSnapshot } from '@/shared/lib/alarmReadState';

import { NotificationQueries } from '@/entities/notification';

/**
 * 알림 점(새 알림) 판정 — 하단 탭·홈 헤더 종·데스크톱 GNB 종이 같이 쓴다(셋이 따로 판정하면 어긋난다).
 * 알림함을 마지막으로 본 뒤 미읽음이 늘었을 때만 켠다. 알림함 위에서는 끈다.
 */
export function useHasNewAlarm() {
  const pathName = usePathname();
  const { isLoggedIn } = useIsLoggedIn();
  const { data: unreadCount } = useQuery({
    ...NotificationQueries.unreadCount(),
    enabled: isLoggedIn,
  });

  const isOnAlarmPage = pathName.startsWith(PAGE.ALARM);

  useEffect(() => {
    if (isOnAlarmPage && unreadCount !== undefined) {
      setUnreadCountSnapshot(unreadCount);
    }
  }, [isOnAlarmPage, unreadCount]);

  let hasNewAlarm = false;
  if (!isOnAlarmPage) {
    const storedCount = getUnreadCountAfterLastRead();
    hasNewAlarm = storedCount === -1 ? (unreadCount ?? 0) > 0 : (unreadCount ?? 0) > storedCount;
  }

  // ★ALARM_DOT_CHANGED 송신을 제거했다. 이 훅은 BottomNavComponent 안에서만
  // 돌고, 그 컴포넌트는 앱에서 아래 `isJirumAlarmApp` 조기 반환에 걸려 렌더되지
  // 않는다 → 앱에 이 메시지가 온 적이 없어 네이티브 탭바 점이 영구히 꺼져 있었다.
  // 이제 점 판정은 네이티브가 직접 한다(mobile useHasNewAlarm).

  return hasNewAlarm;
}
