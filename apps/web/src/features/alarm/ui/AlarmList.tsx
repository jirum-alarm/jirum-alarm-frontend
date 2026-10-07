'use client';

import { useQuery } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo } from 'react';

import { PAGE } from '@/shared/config/page';
import { getLastAlarmReadAt, setLastAlarmReadAt } from '@/shared/lib/alarmReadState';
import Link from '@/shared/ui/Link';

import { AuthQueries } from '@/entities/auth';
import { ThemeQueries } from '@/entities/notification';

import { normalizeKeyword, notificationSource } from '../lib/notificationSource';
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

  // 알림 → 그 알림의 설정(키워드는 펼친 채로·관심사 화면·알림 설정). 지운 키워드·없어진 관심사엔
  // 링크를 안 단다 — 눌러도 갈 데가 없다.
  const { data: myKeywords } = useQuery(AuthQueries.myKeywords({ limit: 20 }));
  const { data: themes } = useQuery(ThemeQueries.themes());
  const watching = useMemo(
    () =>
      new Set((myKeywords?.notificationKeywordsByMe ?? []).map((k) => normalizeKeyword(k.keyword))),
    [myKeywords],
  );

  useEffect(() => {
    setLastAlarmReadAt();
  }, []);

  return (
    <>
      {/* PC 는 다른 내 메뉴 화면처럼 회색 띠 없이 흰 바탕 — 키워드 알림은 사이드바에 있어 안내 띠는 뺀다. */}
      {isEditMode && (
        <div className="pc:top-14 pc:border-gray-100 pc:bg-white sticky top-14 z-40 border-b border-gray-200 bg-gray-50">
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
      {!isEditMode && (
        <div className="pc:hidden sticky top-14 z-40 border-b border-gray-200 bg-gray-50">
          <div className="flex h-11 items-center justify-between px-5">
            <span className="text-sm font-medium text-gray-600">
              지금 다양한 핫딜 알림을 받아보세요!
            </span>
            <Link
              href={PAGE.MYPAGE_KEYWORD}
              className="flex h-8 items-center justify-center rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900"
            >
              키워드 알림
            </Link>
          </div>
        </div>
      )}
      {!loading && noData ? (
        <NoAlerts />
      ) : (
        <ul className="pc:divide-y pc:divide-gray-100">
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
                source={notificationSource(notification.keyword, watching, themes ?? [])}
              />
            );
          })}
          {hasNextData && <div ref={ref} className="h-[48px] w-full" />}
        </ul>
      )}
    </>
  );
}
