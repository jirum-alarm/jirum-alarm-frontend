import {infiniteQueryOptions, queryOptions} from '@tanstack/react-query';

import {NotificationService} from '@/shared/api/notification';

const NOTIFICATION_LIMIT = 20;

/**
 * web `entities/notification` 과 **같은 키 모양**을 유지한다.
 * 낙관적 업데이트가 `lists()` prefix 로 페이지 전체를 훑기 때문에,
 * 키가 어긋나면 setQueriesData 가 아무것도 못 맞춘다.
 */
export const NotificationQueries = {
  all: () => ['notification'] as const,
  lists: () => [...NotificationQueries.all(), 'list'] as const,
  unreadCount: () =>
    queryOptions({
      queryKey: [...NotificationQueries.all(), 'unreadCount'] as const,
      queryFn: () => NotificationService.getUnreadCount(),
      staleTime: 0,
    }),
  /** 헤더의 편집(휴지통) 버튼 노출 판단 — 1건만 찔러본다(web existsAny 동일). */
  existsAny: () =>
    queryOptions({
      queryKey: [...NotificationQueries.all(), 'existsAny'] as const,
      queryFn: async () => {
        const list = await NotificationService.getNotifications({
          offset: 0,
          limit: 1,
        });
        return list.length > 0;
      },
      staleTime: 0,
    }),
  infiniteNotifications: (limit: number = NOTIFICATION_LIMIT) =>
    infiniteQueryOptions({
      queryKey: [...NotificationQueries.lists(), {limit}] as const,
      queryFn: ({pageParam}) =>
        NotificationService.getNotifications({offset: pageParam, limit}),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length < limit ? undefined : allPages.length * limit,
      retry: false,
    }),
};
