'use client';

import { useNotificationsViewModel } from '../hooks/useNotificationsViewModel';

import AlarmItem from './AlarmItem';
import NoAlerts from './NoAlerts';

export default function AlarmList() {
  const { notifications, loading, noData, hasNextData, ref } = useNotificationsViewModel();

  if (loading) {
    return null;
  }

  if (noData) {
    return <NoAlerts />;
  }

  return (
    <>
      <ul>
        {notifications.map((notification) => (
          <AlarmItem key={notification.id} notification={notification} />
        ))}
      </ul>

      {hasNextData && <div ref={ref} className="h-[48px] w-full" />}
    </>
  );
}
