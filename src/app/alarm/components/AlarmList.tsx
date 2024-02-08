'use client';

import { QueryNotifications } from '@/graphql/notification';
import { useQuery } from '@apollo/client';
import AlarmItem from './AlarmItem';
import { INotification } from '@/graphql/interface';
import NoAlerts from './NoAlerts';

const AlarmList = () => {
  const { data, loading } = useQuery<{ notifications: INotification[] }>(QueryNotifications);
  const notifications = data?.notifications;

  if (loading) {
    return;
  }

  if (!notifications?.length) {
    return <NoAlerts />;
  }
  return (
    <ul>
      {notifications.map((notification) => (
        <AlarmItem key={notification.id} notification={notification} />
      ))}
    </ul>
  );
};

export default AlarmList;
