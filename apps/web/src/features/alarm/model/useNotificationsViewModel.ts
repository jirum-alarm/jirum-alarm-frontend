import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { NotificationQueries } from '@/entities/notification/notification.queries';

const limit = 20;

export const useNotificationsViewModel = () => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    NotificationQueries.infiniteNotifications({ limit }),
  );

  const notifications = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);

  const noData = !isLoading && notifications.length === 0;

  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  useEffect(() => {
    // noop: kept for parity and potential side-effects later
  }, [notifications]);

  return {
    notifications,
    loading: isLoading || isFetchingNextPage,
    noData,
    hasNextData: !!hasNextPage,
    ref,
  };
};
