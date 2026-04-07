'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';

import { getLastAlarmReadAt, setLastAlarmReadAt } from '@/shared/lib/alarmReadState';

import { alarmEditModeAtom } from '../model/alarmEditModeAtom';
import { useNotificationsViewModel } from '../model/useNotificationsViewModel';

import AlarmItem from './AlarmItem';
import NoAlerts from './NoAlerts';

export default function AlarmList() {
  const {
    notifications,
    loading,
    noData,
    hasNextData,
    ref,
    onReadNotification,
    onRemoveNotification,
    onRemoveAll,
  } = useNotificationsViewModel();

  const isEditMode = useAtomValue(alarmEditModeAtom);
  const setEditMode = useSetAtom(alarmEditModeAtom);

  const lastReadAt = useMemo(() => getLastAlarmReadAt(), []);

  useEffect(() => {
    setLastAlarmReadAt();
  }, []);

  return (
    <>
      {isEditMode && (
        <div className="sticky top-14 z-40 border-b border-gray-200 bg-gray-50">
          <div className="flex h-11 items-center justify-end gap-x-3 px-5">
            <button
              type="button"
              onClick={() => {
                onRemoveAll();
                setEditMode(false);
              }}
              className="px-1 text-sm font-medium text-gray-600"
            >
              전체 삭제
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="h-8 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900"
            >
              완료
            </button>
          </div>
        </div>
      )}
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
                onDelete={onRemoveNotification}
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
