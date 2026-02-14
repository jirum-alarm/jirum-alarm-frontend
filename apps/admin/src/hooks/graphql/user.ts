import { QueryHookOptions, useQuery } from '@apollo/client';

import { PAGE_LIMIT } from '@/constants/limit';
import { QueryUserByAdmin, QueryUsersByAdmin, QueryUsersTotalCountByAdmin } from '@/graphql/user';

export interface UserListItem {
  id: number;
  email: string;
  nickname: string;
  birthYear: number | null;
  gender: string | null;
  createdAt: string;
  searchAfter: string[];
}

export interface GetUsersVariables {
  limit?: number;
  searchAfter?: string[];
  keyword?: string;
}

export const useGetUsersByAdmin = (variables?: GetUsersVariables, options?: QueryHookOptions) => {
  return useQuery<{ usersByAdmin: UserListItem[] }, GetUsersVariables>(QueryUsersByAdmin, {
    variables: {
      limit: variables?.limit ?? PAGE_LIMIT,
      searchAfter: variables?.searchAfter,
      keyword: variables?.keyword,
    },
    fetchPolicy: 'network-only',
    ...options,
  });
};

export interface UserDetailData {
  id: number;
  email: string;
  nickname: string;
  birthYear: number | null;
  gender: string | null;
  favoriteCategories: number[];
  linkedSocialProviders: string[];
  createdAt: string;
}

export const useGetUserByAdmin = (
  variables: { id: number },
  options?: Omit<QueryHookOptions<{ userByAdmin: UserDetailData }, { id: number }>, 'variables'>,
) => {
  return useQuery<{ userByAdmin: UserDetailData }, { id: number }>(QueryUserByAdmin, {
    variables,
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useGetUsersTotalCountByAdmin = (
  variables?: { keyword?: string },
  options?: QueryHookOptions,
) => {
  return useQuery<{ usersTotalCountByAdmin: number }, { keyword?: string }>(
    QueryUsersTotalCountByAdmin,
    {
      variables,
      fetchPolicy: 'network-only',
      ...options,
    },
  );
};
