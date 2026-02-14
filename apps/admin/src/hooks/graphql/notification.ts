import { MutationHookOptions, QueryHookOptions, useMutation, useQuery } from '@apollo/client';

import { PAGE_LIMIT } from '@/constants/limit';
import { MutationSendNotificationByAdmin, QueryNotificationsByAdmin } from '@/graphql/notification';

export interface NotificationListItem {
  id: number;
  title: string;
  message: string;
  target: string | null;
  targetId: number | null;
  createdAt: string;
  searchAfter: string[];
}

export interface GetNotificationsVariables {
  limit?: number;
  searchAfter?: string[];
}

export const useGetNotificationsByAdmin = (
  variables?: GetNotificationsVariables,
  options?: QueryHookOptions,
) => {
  return useQuery<{ notificationsByAdmin: NotificationListItem[] }, GetNotificationsVariables>(
    QueryNotificationsByAdmin,
    {
      variables: {
        limit: variables?.limit ?? PAGE_LIMIT,
        searchAfter: variables?.searchAfter,
      },
      fetchPolicy: 'network-only',
      ...options,
    },
  );
};

export interface SendNotificationVariables {
  title: string;
  message: string;
  type: string;
  target?: string;
  targetId?: number;
  url?: string;
  userIds?: number[];
}

export const useSendNotificationByAdmin = (
  options?: MutationHookOptions<{ sendNotificationByAdmin: boolean }, SendNotificationVariables>,
) => {
  return useMutation<{ sendNotificationByAdmin: boolean }, SendNotificationVariables>(
    MutationSendNotificationByAdmin,
    {
      refetchQueries: [{ query: QueryNotificationsByAdmin, variables: { limit: PAGE_LIMIT } }],
      ...options,
    },
  );
};
