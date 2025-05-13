import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { graphql } from '@/shared/api/gql';
import { QueryNotificationsQueryVariables } from '@/shared/api/gql/graphql';
import { NotificationService } from '@/shared/api/notification';

export const NotificationQueries = {
  all: () => ['notification'],
  notifications: (variables: QueryNotificationsQueryVariables) =>
    queryOptions({
      queryKey: [...NotificationQueries.all(), 'notifications', variables],
      queryFn: () => NotificationService.getNotifications(variables),
    }),
  infiniteNotifications: (variables: QueryNotificationsQueryVariables) =>
    infiniteQueryOptions({
      queryKey: [...NotificationQueries.notifications(variables).queryKey],
      queryFn: ({ pageParam }) =>
        NotificationService.getNotifications({ ...variables, offset: pageParam }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        return allPages.length * variables.limit;
      },
    }),
};
