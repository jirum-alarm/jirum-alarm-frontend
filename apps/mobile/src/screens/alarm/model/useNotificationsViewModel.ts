import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {Platform} from 'react-native';
import * as Notifications from 'expo-notifications';

import {NotificationQueries} from '@/entities/notification';
import {NotificationService} from '@/shared/api/notification';
import {setUnreadCount} from '@/shared/hooks/useUnreadNotifications';

type Page = Awaited<ReturnType<typeof NotificationService.getNotifications>>;
type InfiniteData = {pages: Page[]; pageParams: unknown[]};

/**
 * 알림 목록 + 읽음/삭제 4개 뮤테이션. web
 * `features/alarm/model/useNotificationsViewModel` 과 동작을 맞춘다.
 *
 * ★web 은 매 뮤테이션 뒤 `NOTIFICATION_READ` 를 브릿지로 올려 네이티브가
 * **앱 아이콘 배지**를 갱신했다(event.ts notificationRead). 이 화면이 네이티브가
 * 되면 그 브릿지가 안 오므로 **여기서 직접 배지를 쓴다** — 안 하면 읽어도
 * 배지 숫자가 영구히 안 내려간다(웹뷰 시절엔 웹이 대신 해주던 일).
 */
export function useNotificationsViewModel() {
  const queryClient = useQueryClient();

  const {
    data,
    isPending,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(NotificationQueries.infiniteNotifications());

  const notifications = data?.pages.flat() ?? [];
  const noData = !isPending && notifications.length === 0;

  /** 낙관적 업데이트 공통부 — 목록 페이지를 즉시 바꾸고 롤백 스냅샷을 남긴다. */
  const optimistic = async (update: (page: Page) => Page) => {
    await queryClient.cancelQueries({queryKey: NotificationQueries.lists()});
    const previousData = queryClient.getQueriesData({
      queryKey: NotificationQueries.lists(),
    });
    queryClient.setQueriesData(
      {queryKey: NotificationQueries.lists()},
      (old: InfiniteData | undefined) =>
        old ? {...old, pages: old.pages.map(update)} : old,
    );
    return {previousData};
  };

  const rollback = (
    context: {previousData: [readonly unknown[], unknown][]} | undefined,
  ) => {
    context?.previousData.forEach(([queryKey, previous]) => {
      queryClient.setQueryData(queryKey, previous);
    });
  };

  /**
   * 읽음/삭제 후 미읽음 수를 서버에서 다시 받아 배지·전역 스토어에 반영한다.
   * web 의 onSettled(무효화 → getUnreadCount → 브릿지 전송)와 같은 순서.
   */
  const syncUnreadCount = async (invalidateLists: boolean) => {
    if (invalidateLists) {
      await queryClient.invalidateQueries({
        queryKey: NotificationQueries.lists(),
      });
    }
    await queryClient.invalidateQueries({
      queryKey: NotificationQueries.unreadCount().queryKey,
    });
    // 목록 화면의 편집 버튼 노출 판단도 같이 갱신한다(전체삭제 후 버튼이 남던 자리).
    await queryClient.invalidateQueries({
      queryKey: NotificationQueries.existsAny().queryKey,
    });
    const unreadCount = (await NotificationService.getUnreadCount()) ?? 0;
    setUnreadCount(unreadCount);
    // 배지는 iOS 만 (fcm-handler 와 같은 가드). Android 는 런처마다 달라
    // expo-notifications 가 no-op 이거나 던진다.
    // ★배지 실패가 읽음/삭제 자체를 깨서는 안 된다 — onSettled 에서 throw 하면
    //   react-query 가 unhandled rejection 을 올린다.
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(unreadCount).catch(() => {});
    }
  };

  const {mutate: onReadNotification} = useMutation({
    mutationFn: (id: number) => NotificationService.readNotification(id),
    onMutate: (id: number) =>
      optimistic(page =>
        page.map(n =>
          Number(n.id) === id ? {...n, readAt: new Date().toISOString()} : n,
        ),
      ),
    onError: (_err, _id, context) => rollback(context),
    onSettled: () => syncUnreadCount(false),
  });

  const {mutate: onReadAll} = useMutation({
    mutationFn: () => NotificationService.readAllNotifications(),
    onMutate: () =>
      optimistic(page =>
        page.map(n => ({...n, readAt: new Date().toISOString()})),
      ),
    onError: (_err, _vars, context) => rollback(context),
    onSettled: () => syncUnreadCount(false),
  });

  const {mutate: onRemoveNotification} = useMutation({
    mutationFn: (id: number) => NotificationService.removeNotification(id),
    onMutate: (id: number) =>
      optimistic(page => page.filter(n => Number(n.id) !== id)),
    onError: (_err, _id, context) => rollback(context),
    onSettled: () => syncUnreadCount(true),
  });

  const {mutate: onRemoveAll} = useMutation({
    mutationFn: () => NotificationService.removeAllNotifications(),
    onMutate: () => optimistic(() => []),
    onError: (_err, _vars, context) => rollback(context),
    onSettled: () => syncUnreadCount(true),
  });

  return {
    notifications,
    isPending,
    isError,
    refetch,
    noData,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    onReadNotification,
    onReadAll,
    onRemoveNotification,
    onRemoveAll,
  };
}
