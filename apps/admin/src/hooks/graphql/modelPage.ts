import { useMutation, useQuery } from '@apollo/client/react';

import {
  MutationSetModelPagePublishedByAdminMutation,
  MutationSetModelPagePublishedByAdminMutationVariables,
  QueryModelPagePreviewByAdminQuery,
  QueryModelPagePreviewByAdminQueryVariables,
  QueryModelPagesByAdminQuery,
  QueryModelPagesByAdminQueryVariables,
} from '@/generated/gql/graphql';
import {
  MutationSetModelPagePublishedByAdmin,
  QueryModelPagePreviewByAdmin,
  QueryModelPagesByAdmin,
} from '@/graphql/modelPage';

import { QueryOptions } from './options';

export const useGetModelPagesByAdmin = (
  variables?: QueryModelPagesByAdminQueryVariables,
  options?: QueryOptions<QueryModelPagesByAdminQuery, QueryModelPagesByAdminQueryVariables>,
) => {
  return useQuery<QueryModelPagesByAdminQuery, QueryModelPagesByAdminQueryVariables>(
    QueryModelPagesByAdmin,
    {
      variables: {
        onlyDrafts: variables?.onlyDrafts ?? false,
      },
      fetchPolicy: 'network-only',
      ...options,
    },
  );
};

export const useGetModelPagePreviewByAdmin = (
  variables: QueryModelPagePreviewByAdminQueryVariables,
  options?: QueryOptions<
    QueryModelPagePreviewByAdminQuery,
    QueryModelPagePreviewByAdminQueryVariables
  >,
) => {
  return useQuery<QueryModelPagePreviewByAdminQuery, QueryModelPagePreviewByAdminQueryVariables>(
    QueryModelPagePreviewByAdmin,
    {
      variables,
      fetchPolicy: 'network-only',
      ...options,
    },
  );
};

export const useSetModelPagePublishedByAdmin = (
  options?: useMutation.Options<
    MutationSetModelPagePublishedByAdminMutation,
    MutationSetModelPagePublishedByAdminMutationVariables
  >,
) => {
  return useMutation<
    MutationSetModelPagePublishedByAdminMutation,
    MutationSetModelPagePublishedByAdminMutationVariables
  >(MutationSetModelPagePublishedByAdmin, {
    // 목록을 다시 받아 토글 결과 반영(낙관적 업데이트 없이 단순 refetch).
    refetchQueries: [{ query: QueryModelPagesByAdmin, variables: { onlyDrafts: false } }],
    ...options,
  });
};
