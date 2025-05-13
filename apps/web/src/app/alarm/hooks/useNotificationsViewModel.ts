'use client';

import { useInfiniteQuery, useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

import { NotificationQueries } from '@/entities/notification/notification.queries';

const limit = 20;

export const useNotificationsViewModel = () => {
  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery(
    NotificationQueries.infiniteNotifications({
      limit,
      offset: 0,
    }),
  );

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];

  const noData = !isFetching && notifications.length === 0;
  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextPage) {
        fetchNextPage();
      }
    },
  });

  return {
    notifications,
    noData,
    hasNextPage,
    ref,
  };
};
