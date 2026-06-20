import { MutationHookOptions, QueryHookOptions, useMutation, useQuery } from '@apollo/client';

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

export const useGetModelPagesByAdmin = (
  variables?: QueryModelPagesByAdminQueryVariables,
  options?: QueryHookOptions<QueryModelPagesByAdminQuery, QueryModelPagesByAdminQueryVariables>,
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
  options?: QueryHookOptions<
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
  options?: MutationHookOptions<
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
