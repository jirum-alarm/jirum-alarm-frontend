'use client';

import { NotificationItem } from '@/entities/notification';

import { useNotificationsViewModel } from '../model/useNotificationsViewModel';

import NoAlerts from './NoAlerts';

export default function AlarmList() {
  const { notifications, loading, noData, hasNextData, ref } = useNotificationsViewModel();

  return (
    <>
      {!loading && noData ? (
        <NoAlerts />
      ) : (
        <ul>
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
          {hasNextData && <div ref={ref} className="h-[48px] w-full" />}
        </ul>
      )}
    </>
  );
}
