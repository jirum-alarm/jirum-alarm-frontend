'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

import { NotificationService } from '@/shared/api/notification/notification.service';
import { setAlarmReadState } from '@/shared/lib/alarmReadState';
import { WebViewBridge } from '@/shared/lib/webview/sender';
import { WebViewEventType } from '@/shared/lib/webview/type';
import { useToast } from '@/shared/ui/common/Toast';

import { NotificationQueries } from '@/entities/notification';

/** 되돌리기 토스트가 떠 있는 시간(동작 버튼이 있으면 4초)과 같게. */
const UNDO_WINDOW_MS = 4000;

const limit = 20;

export const useNotificationsViewModel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  /**
   * 알림함에 들어오면 서버에서 모두 읽음 처리한다(앱 useNotificationsViewModel 과 같은 규칙).
   * 앱 아이콘 배지 = 서버 미읽음 수라, 들어올 때 안 읽으면 배지가 영구히 쌓였다(2026-10-05 운영: 중앙값 310).
   *
   * ★목록을 **먼저** 다시 받고 그다음 읽음 처리한다. 목록 캐시가 1분 신선해서(staleTime) 다시 들어오면
   * 방금 온 알림이 목록에 없었고, 읽음 처리를 먼저 하면 새 알림이 읽은 채로 내려와 강조가 사라진다.
   * 읽음 처리 뒤엔 목록 캐시를 건드리지 않는다 — 이번 방문 동안은 새 알림의 안 읽음 표시가 그대로 보인다.
   */
  useEffect(() => {
    // cancelRefetch:false — 첫 방문엔 첫 조회가 이미 날아가는 중이라 그걸 기다린다.
    queryClient
      .refetchQueries(
        { queryKey: NotificationQueries.lists(), type: 'active' },
        { cancelRefetch: false },
      )
      .catch(() => {})
      .then(() => NotificationService.readAllNotifications())
      .then(async () => {
        await queryClient.invalidateQueries({
          queryKey: NotificationQueries.unreadCount().queryKey,
        });
        setAlarmReadState(0);
        WebViewBridge.sendMessage(WebViewEventType.NOTIFICATION_READ, { data: { unreadCount: 0 } });
      })
      .catch(() => {});
  }, [queryClient]);

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

  const { mutate: removeNotification } = useMutation({
    mutationFn: (id: number) => NotificationService.removeNotification({ id }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NotificationQueries.lists() });

      const previousData = queryClient.getQueriesData({ queryKey: NotificationQueries.lists() });

      queryClient.setQueriesData({ queryKey: NotificationQueries.lists() }, (old: typeof data) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => page.filter((n) => Number(n.id) !== id)),
        };
      });

      return { previousData };
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: NotificationQueries.lists() });
      await queryClient.invalidateQueries({ queryKey: NotificationQueries.unreadCount().queryKey });
      const unreadCount = await NotificationService.getUnreadCount();
      setAlarmReadState(unreadCount ?? 0);
      WebViewBridge.sendMessage(WebViewEventType.NOTIFICATION_READ, {
        data: { unreadCount: unreadCount ?? 0 },
      });
    },
    onError: (_err, _id, context) => {
      toast.error('알림을 삭제하지 못했어요.');
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });

  const { mutate: removeAllNotifications } = useMutation({
    mutationFn: () => NotificationService.removeAllNotifications(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NotificationQueries.lists() });

      const previousData = queryClient.getQueriesData({ queryKey: NotificationQueries.lists() });

      queryClient.setQueriesData({ queryKey: NotificationQueries.lists() }, (old: typeof data) => {
        if (!old) return old;
        return { ...old, pages: old.pages.map(() => []) };
      });

      return { previousData };
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: NotificationQueries.lists() });
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

  // 한 개 삭제는 되돌리기를 준다(앱과 같음) — 알림은 다시 만들 수 없어서 목록에서만 먼저 지우고,
  // 되돌리기 토스트가 떠 있는 동안 서버 삭제를 미룬다. 되돌리면 서버엔 아무 일도 없었던 것.
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const onRemoveNotification = useCallback(
    (id: number) => {
      queryClient.setQueriesData({ queryKey: NotificationQueries.lists() }, (old: typeof data) =>
        old
          ? { ...old, pages: old.pages.map((page) => page.filter((n) => Number(n.id) !== id)) }
          : old,
      );
      timers.current.set(
        id,
        setTimeout(() => {
          timers.current.delete(id);
          removeNotification(id);
        }, UNDO_WINDOW_MS),
      );
      toast.success('알림을 삭제했어요.', {
        action: {
          label: '되돌리기',
          onClick: () => {
            clearTimeout(timers.current.get(id));
            timers.current.delete(id);
            queryClient.invalidateQueries({ queryKey: NotificationQueries.lists() });
          },
        },
      });
    },
    [queryClient, removeNotification, toast],
  );

  return {
    notifications,
    loading: isLoading || isFetchingNextPage,
    noData,
    hasNextData: !!hasNextPage,
    ref,
    onReadNotification: readNotification,
    onReadAll: readAllNotifications,
    onRemoveNotification,
    onRemoveAll: removeAllNotifications,
  };
};
