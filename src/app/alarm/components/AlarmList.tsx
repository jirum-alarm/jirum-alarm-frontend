'use client';

import AlarmItem from './AlarmItem';
import NoAlerts from './NoAlerts';
import { useNotificationsViewModel } from '../hooks/useNotificationsViewModel';

const AlarmList = () => {
  const { notifications, loading, noData, hasNextData, ref } = useNotificationsViewModel();

  if (loading) {
    return;
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
};

export default AlarmList;
