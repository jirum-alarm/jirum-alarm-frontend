import {useCallback} from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {useFocusEffect} from '@react-navigation/native';
import {Platform} from 'react-native';
import * as Notifications from 'expo-notifications';

import {NotificationQueries} from '@/entities/notification';
import {NotificationService} from '@/shared/api/notification';
import {setUnreadCount} from '@/shared/hooks/useUnreadNotifications';
import {setAlarmUnreadSnapshot} from '@/shared/lib/alarm-unread-snapshot';
import {showToast} from '@/shared/lib/feedback';

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
  const syncUnreadCount = useCallback(
    async (invalidateLists: boolean) => {
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
      // 알림함을 본(=읽음/삭제한) 시점의 미읽음 수를 탭바 점의 기준선으로 박는다.
      // 이게 없으면 안 읽고 남긴 알림이 점을 영구히 켜둔다(web setAlarmReadState 대응).
      setAlarmUnreadSnapshot(unreadCount);
      // 배지는 iOS 만 (fcm-handler 와 같은 가드). Android 는 런처마다 달라
      // expo-notifications 가 no-op 이거나 던진다.
      // ★배지 실패가 읽음/삭제 자체를 깨서는 안 된다 — onSettled 에서 throw 하면
      //   react-query 가 unhandled rejection 을 올린다.
      if (Platform.OS === 'ios') {
        await Notifications.setBadgeCountAsync(unreadCount).catch(() => {});
      }
    },
    [queryClient],
  );

  /**
   * 화면에 들어오면 **서버에서 모두 읽음** 처리하고 기준선·배지를 다시 맞춘다(→ 배지 0).
   *
   * ★배지는 서버가 푸시마다 "미읽음 수"를 싣는데, 미읽음을 줄이는 길이 항목을 하나씩 누르는 것뿐이라
   * 사용자 배지가 중앙값 310·최대 2.5만으로 쌓여 있었다(2026-10-05 운영 실측). 들어올 때 모두 읽으면
   * 배지 = "알림함을 마지막으로 본 뒤 새로 온 수"가 된다.
   *
   * ★목록을 **먼저** 다시 받고 그다음 읽음 처리한다. 탭 화면은 살아 있어 목록이 옛 캐시 그대로라,
   * 탭바 점을 보고 들어와도 방금 온 알림이 목록에 없었다. 읽음 처리를 먼저 하면 새 알림이
   * 읽은 채로(흐리게) 내려와 "새 알림" 강조가 사라진다. 읽음 처리 뒤엔 목록 캐시를 건드리지 않는다 —
   * 이번 방문 동안은 새 알림의 안 읽음 표시가 그대로 보인다.
   *
   * 마운트 effect 로는 부족하다: 탭 화면은 한 번 마운트되면 계속 살아 있어 두 번째 방문부터 안 돈다.
   */
  useFocusEffect(
    useCallback(() => {
      // 실패는 삼킨다 — 읽음 처리·기준선 갱신이 안 돼도 화면은 그대로 쓸 수 있고,
      // 다음 포커스에 다시 시도한다(여기서 던지면 unhandled rejection).
      // cancelRefetch:false — 첫 방문엔 첫 조회가 이미 날아가는 중이라 그걸 기다린다.
      queryClient
        .refetchQueries(
          {queryKey: NotificationQueries.lists(), type: 'active'},
          {cancelRefetch: false},
        )
        .catch(() => {})
        .then(() => NotificationService.readAllNotifications())
        .catch(() => {})
        .then(() => syncUnreadCount(false))
        .catch(() => {});
    }, [queryClient, syncUnreadCount]),
  );

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
    onError: (_err, _id, context) => {
      rollback(context);
      showToast.error('알림을 삭제하지 못했어요.');
    },
    onSettled: () => syncUnreadCount(true),
  });

  const {mutate: onRemoveAll} = useMutation({
    mutationFn: () => NotificationService.removeAllNotifications(),
    onMutate: () => optimistic(() => []),
    onError: (_err, _vars, context) => {
      rollback(context);
      showToast.error('알림을 삭제하지 못했어요.');
    },
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
