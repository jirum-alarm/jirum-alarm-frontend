'use client';

import { useTransition } from 'react';
import { useInView } from 'react-intersection-observer';

import { useGetNotificationsByAdmin } from '@/hooks/graphql/notification';
import { dateFormatter } from '@/utils/date';

const NOTIFICATION_TARGET_MAP: Record<string, string> = {
  PRODUCT: '상품',
  NOTICE: '공지',
  INFO: '정보',
};

const NotificationHistory = () => {
  const [, startTransition] = useTransition();
  const { data, loading, fetchMore } = useGetNotificationsByAdmin();
  const notifications = data?.notificationsByAdmin ?? [];

  const { ref: viewRef } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (!inView || loading || notifications.length === 0) return;
      const searchAfter = notifications[notifications.length - 1]?.searchAfter;
      if (!searchAfter) return;
      startTransition(() => {
        fetchMore({
          variables: { searchAfter },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            return {
              notificationsByAdmin: [
                ...prev.notificationsByAdmin,
                ...fetchMoreResult.notificationsByAdmin,
              ],
            };
          },
        });
      });
    },
  });

  return (
    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="px-5 py-4 sm:px-7.5">
        <h3 className="text-lg font-semibold text-black dark:text-white">발송 이력</h3>
      </div>
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-2 text-left dark:bg-meta-4">
            <th className="w-16 px-4 py-4 text-center text-sm font-medium text-bodydark2">ID</th>
            <th className="min-w-[200px] px-4 py-4 text-sm font-medium text-bodydark2">제목</th>
            <th className="min-w-[200px] px-4 py-4 text-sm font-medium text-bodydark2">메시지</th>
            <th className="w-20 px-4 py-4 text-center text-sm font-medium text-bodydark2">타겟</th>
            <th className="w-28 px-4 py-4 text-center text-sm font-medium text-bodydark2">
              발송일
            </th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification) => (
            <tr key={notification.id} className="border-b border-stroke dark:border-strokedark">
              <td className="px-4 py-3 text-center text-sm text-black dark:text-white">
                {notification.id}
              </td>
              <td className="px-4 py-3 text-sm text-black dark:text-white">{notification.title}</td>
              <td className="px-4 py-3">
                <p className="line-clamp-2 text-sm text-bodydark2">{notification.message}</p>
              </td>
              <td className="px-4 py-3 text-center text-sm text-bodydark2">
                {notification.target
                  ? (NOTIFICATION_TARGET_MAP[notification.target] ?? notification.target)
                  : '전체'}
              </td>
              <td className="px-4 py-3 text-center text-xs text-bodydark2">
                {notification.createdAt ? dateFormatter(notification.createdAt) : '-'}
              </td>
            </tr>
          ))}

          {loading && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {!loading && notifications.length === 0 && (
        <div className="px-4 py-12 text-center text-sm text-bodydark2">발송 이력이 없습니다.</div>
      )}

      <div ref={viewRef} className="h-4" />
    </div>
  );
};

export default NotificationHistory;
