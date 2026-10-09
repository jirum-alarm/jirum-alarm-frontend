import { useMutation, useQuery } from '@apollo/client/react';

import {
  MutationAdminLoginMutation,
  MutationAdminLoginMutationVariables,
  QueryAdminMeQuery,
  QueryAdminMeQueryVariables,
} from '@/generated/gql/graphql';
import { MutationAdminLogin, QueryAdminMe } from '@/graphql/auth';

import { QueryOptions } from './options';

export const useMutationAdminLogin = (
  options?: useMutation.Options<MutationAdminLoginMutation, MutationAdminLoginMutationVariables>,
) => {
  return useMutation<MutationAdminLoginMutation, MutationAdminLoginMutationVariables>(
    MutationAdminLogin,
    {
      ...options,
    },
  );
};

export const useAdminMe = (
  options?: QueryOptions<QueryAdminMeQuery, QueryAdminMeQueryVariables>,
) => {
  return useQuery<QueryAdminMeQuery, QueryAdminMeQueryVariables>(QueryAdminMe, {
    fetchPolicy: 'cache-first',
    ...options,
  });
};
