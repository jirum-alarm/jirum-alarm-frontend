import { infiniteQueryOptions } from '@tanstack/react-query';

import { QueryNotificationsQueryVariables } from '@/shared/api/gql/graphql';
import { NotificationService } from '@/shared/api/notification/notification.service';

const NOTIFICATION_LIMIT = 20;

export const NotificationQueries = {
  all: () => ['notification'],
  lists: () => [...NotificationQueries.all(), 'list'],
  infiniteNotifications: (variables?: Partial<QueryNotificationsQueryVariables>) => {
    const merged: QueryNotificationsQueryVariables = {
      offset: 0,
      limit: variables?.limit ?? NOTIFICATION_LIMIT,
    } as QueryNotificationsQueryVariables;

    return infiniteQueryOptions({
      queryKey: [
        ...NotificationQueries.lists(),
        {
          limit: merged.limit,
        },
      ],
      queryFn: async ({ pageParam }) =>
        NotificationService.getNotifications({
          ...merged,
          offset: (pageParam as number | undefined) ?? 0,
        }).then((d) => d.notifications),
      initialPageParam: 0 as number,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length < merged.limit ? undefined : allPages.length * merged.limit;
      },
    });
  },
};
