import { MutationHookOptions, QueryHookOptions, useMutation, useQuery } from '@apollo/client';

import {
  MutationAdminLoginMutation,
  MutationAdminLoginMutationVariables,
  QueryAdminMeQuery,
  QueryAdminMeQueryVariables,
} from '@/generated/gql/graphql';
import { MutationAdminLogin, QueryAdminMe } from '@/graphql/auth';

export const useMutationAdminLogin = (
  options?: MutationHookOptions<MutationAdminLoginMutation, MutationAdminLoginMutationVariables>,
) => {
  return useMutation<MutationAdminLoginMutation, MutationAdminLoginMutationVariables>(
    MutationAdminLogin,
    {
      ...options,
    },
  );
};

export const useAdminMe = (
  options?: QueryHookOptions<QueryAdminMeQuery, QueryAdminMeQueryVariables>,
) => {
  return useQuery<QueryAdminMeQuery, QueryAdminMeQueryVariables>(QueryAdminMe, {
    fetchPolicy: 'cache-first',
    ...options,
  });
};
