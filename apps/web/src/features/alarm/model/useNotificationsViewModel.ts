'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { NotificationService } from '@/shared/api/notification/notification.service';
import { setAlarmReadState } from '@/shared/lib/alarmReadState';
import { WebViewBridge } from '@/shared/lib/webview/sender';
import { WebViewEventType } from '@/shared/lib/webview/type';

import { NotificationQueries } from '@/entities/notification';

const limit = 20;

export const useNotificationsViewModel = () => {
  const queryClient = useQueryClient();

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

  const { mutate: readNotification } = useMutation({
    mutationFn: (id: number) => NotificationService.readNotification({ id }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NotificationQueries.lists() });

      const previousData = queryClient.getQueriesData({ queryKey: NotificationQueries.lists() });

      queryClient.setQueriesData({ queryKey: NotificationQueries.lists() }, (old: typeof data) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((n) => (Number(n.id) === id ? { ...n, readAt: new Date() } : n)),
          ),
        };
      });

      return { previousData };
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: NotificationQueries.unreadCount().queryKey });
      const unreadCount = await NotificationService.getUnreadCount();
      setAlarmReadState(unreadCount ?? 0);
      WebViewBridge.sendMessage(WebViewEventType.NOTIFICATION_READ, {
        data: { unreadCount: unreadCount ?? 0 },
      });
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });

  const { mutate: readAllNotifications } = useMutation({
    mutationFn: () => NotificationService.readAllNotifications(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NotificationQueries.lists() });

      const previousData = queryClient.getQueriesData({ queryKey: NotificationQueries.lists() });

      queryClient.setQueriesData({ queryKey: NotificationQueries.lists() }, (old: typeof data) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => page.map((n) => ({ ...n, readAt: new Date() }))),
        };
      });

      return { previousData };
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: NotificationQueries.unreadCount().queryKey });
      const unreadCount = await NotificationService.getUnreadCount();
      setAlarmReadState(unreadCount ?? 0);
      WebViewBridge.sendMessage(WebViewEventType.NOTIFICATION_READ, {
        data: { unreadCount: unreadCount ?? 0 },
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });

  return {
    notifications,
    loading: isLoading || isFetchingNextPage,
    noData,
    hasNextData: !!hasNextPage,
    ref,
    onReadNotification: readNotification,
    onReadAll: readAllNotifications,
  };
};
