import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { NotificationQueries } from '@/entities/notification/notification.queries';

const limit = 20;

export const useNotificationsViewModel = () => {
  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery(NotificationQueries.infiniteNotifications({ limit }));

  const notifications = useMemo(() => (data?.pages ?? []).flat(), [data?.pages]);

  const noData = !isLoading && notifications.length === 0;

  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  const isNotLogin = (error as any)?.response?.errors?.[0]?.extensions?.code === 'FORBIDDEN';

  useEffect(() => {
    // noop: kept for parity and potential side-effects later
  }, [notifications]);

  return {
    notifications,
    loading: isLoading || isFetchingNextPage,
    isNotLogin,
    noData,
    hasNextData: !!hasNextPage,
    ref,
  };
};
