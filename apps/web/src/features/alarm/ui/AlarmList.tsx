'use client';

import { useNotificationsViewModel } from '../model/useNotificationsViewModel';

import AlarmItem from './AlarmItem';
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
            <AlarmItem key={notification.id} notification={notification} />
          ))}
          {hasNextData && <div ref={ref} className="h-[48px] w-full" />}
        </ul>
      )}
    </>
  );
}
