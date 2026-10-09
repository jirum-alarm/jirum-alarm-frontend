'use client';

import Panel from '@/components/Panel';
import Spinner from '@/components/Spinner';
import { useGetNotificationsByAdmin } from '@/hooks/graphql/notification';
import { useLoadMoreOnView } from '@/hooks/useLoadMoreOnView';
import { dateFormatter } from '@/utils/date';

const NOTIFICATION_TARGET_MAP: Record<string, string> = {
  PRODUCT: '상품',
  NOTICE: '공지',
  INFO: '정보',
  COMMENT: '댓글',
};

const NotificationHistory = () => {
  const { data, loading, fetchMore } = useGetNotificationsByAdmin();
  const notifications = data?.notificationsByAdmin ?? [];

  const viewRef = useLoadMoreOnView({ field: 'notificationsByAdmin', data, loading, fetchMore });

  return (
    <Panel>
      <div className="px-5 py-4 sm:px-7.5">
        <h3 className="text-lg font-semibold text-black dark:text-white">발송 이력</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="table-cards w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="w-16 px-4 py-4 text-center text-sm font-medium text-bodydark2">ID</th>
              <th className="min-w-[160px] px-4 py-4 text-sm font-medium text-bodydark2 md:min-w-[200px]">
                제목
              </th>
              <th className="min-w-[200px] px-4 py-4 text-sm font-medium text-bodydark2">메시지</th>
              <th className="w-20 px-4 py-4 text-center text-sm font-medium text-bodydark2">
                타겟
              </th>
              <th className="w-28 px-4 py-4 text-center text-sm font-medium text-bodydark2">
                발송일
              </th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => (
              <tr key={notification.id} className="border-b border-stroke dark:border-strokedark">
                <td
                  data-label="ID"
                  className="px-4 py-3 text-center text-sm text-black dark:text-white"
                >
                  {notification.id}
                </td>
                <td className="px-4 py-3 text-sm text-black dark:text-white">
                  {notification.title}
                </td>
                <td data-label="메시지" className="px-4 py-3">
                  <p className="line-clamp-2 text-sm text-bodydark2">{notification.message}</p>
                </td>
                <td
                  data-label="타겟"
                  className="px-4 py-3 text-center text-sm text-bodydark2 md:whitespace-nowrap"
                >
                  {notification.target
                    ? (NOTIFICATION_TARGET_MAP[notification.target] ?? notification.target)
                    : '전체'}
                </td>
                <td
                  data-label="발송일"
                  className="px-4 py-3 text-center text-xs text-bodydark2 md:whitespace-nowrap"
                >
                  {notification.createdAt ? dateFormatter(notification.createdAt) : '-'}
                </td>
              </tr>
            ))}

            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <Spinner size="lg" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && notifications.length === 0 && (
        <div className="px-4 py-12 text-center text-sm text-bodydark2">발송 이력이 없습니다.</div>
      )}

      <div ref={viewRef} className="h-4" />
    </Panel>
  );
};

export default NotificationHistory;
