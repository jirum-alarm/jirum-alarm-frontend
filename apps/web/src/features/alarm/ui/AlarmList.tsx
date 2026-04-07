'use client';

import { useEffect, useMemo } from 'react';

import { getLastAlarmReadAt, setLastAlarmReadAt } from '@/shared/lib/alarmReadState';

import { useNotificationsViewModel } from '../model/useNotificationsViewModel';

import AlarmItem from './AlarmItem';
import NoAlerts from './NoAlerts';

export default function AlarmList() {
  const { notifications, loading, noData, hasNextData, ref, onReadNotification } =
    useNotificationsViewModel();

  const lastReadAt = useMemo(() => getLastAlarmReadAt(), []);

  useEffect(() => {
    setLastAlarmReadAt();
  }, []);

  return (
    <>
      {!loading && noData ? (
        <NoAlerts />
      ) : (
        <ul>
          {notifications.map((notification) => {
            const isNew =
              new Date(notification.createdAt).getTime() > lastReadAt && !notification.readAt;
            return (
              <AlarmItem
                key={notification.id}
                notification={notification}
                onRead={onReadNotification}
                isNew={isNew}
              />
            );
          })}
          {hasNextData && <div ref={ref} className="h-[48px] w-full" />}
        </ul>
      )}
    </>
  );
}
