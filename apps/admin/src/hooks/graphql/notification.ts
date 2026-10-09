import { useMutation, useQuery } from '@apollo/client/react';

import { PAGE_LIMIT } from '@/constants/limit';
import {
  MutationSendNotificationByAdminMutation,
  MutationSendNotificationByAdminMutationVariables,
  QueryNotificationsByAdminQuery,
  QueryNotificationsByAdminQueryVariables,
} from '@/generated/gql/graphql';
import { MutationSendNotificationByAdmin, QueryNotificationsByAdmin } from '@/graphql/notification';

import { QueryOptions } from './options';

export const useGetNotificationsByAdmin = (
  variables?: Partial<QueryNotificationsByAdminQueryVariables>,
  options?: QueryOptions<QueryNotificationsByAdminQuery, QueryNotificationsByAdminQueryVariables>,
) => {
  return useQuery<QueryNotificationsByAdminQuery, QueryNotificationsByAdminQueryVariables>(
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

export const useSendNotificationByAdmin = (
  options?: useMutation.Options<
    MutationSendNotificationByAdminMutation,
    MutationSendNotificationByAdminMutationVariables
  >,
) => {
  return useMutation<
    MutationSendNotificationByAdminMutation,
    MutationSendNotificationByAdminMutationVariables
  >(MutationSendNotificationByAdmin, {
    refetchQueries: [{ query: QueryNotificationsByAdmin, variables: { limit: PAGE_LIMIT } }],
    ...options,
  });
};
