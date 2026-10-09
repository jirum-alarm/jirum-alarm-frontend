import { useQuery } from '@apollo/client/react';

import { PAGE_LIMIT } from '@/constants/limit';
import {
  QueryUserByAdminQuery,
  QueryUserByAdminQueryVariables,
  QueryUsersByAdminQuery,
  QueryUsersByAdminQueryVariables,
} from '@/generated/gql/graphql';
import { QueryUserByAdmin, QueryUsersByAdmin } from '@/graphql/user';

import { QueryOptions } from './options';

export type UserListItem = QueryUsersByAdminQuery['usersByAdmin'][number];

export const useGetUsersByAdmin = (
  variables?: Partial<QueryUsersByAdminQueryVariables>,
  options?: QueryOptions<QueryUsersByAdminQuery, QueryUsersByAdminQueryVariables>,
) => {
  return useQuery<QueryUsersByAdminQuery, QueryUsersByAdminQueryVariables>(QueryUsersByAdmin, {
    variables: {
      limit: variables?.limit ?? PAGE_LIMIT,
      searchAfter: variables?.searchAfter,
      keyword: variables?.keyword,
    },
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useGetUserByAdmin = (
  variables: QueryUserByAdminQueryVariables,
  options?: Omit<QueryOptions<QueryUserByAdminQuery, QueryUserByAdminQueryVariables>, 'variables'>,
) => {
  return useQuery<QueryUserByAdminQuery, QueryUserByAdminQueryVariables>(QueryUserByAdmin, {
    variables,
    fetchPolicy: 'network-only',
    ...options,
  });
};
