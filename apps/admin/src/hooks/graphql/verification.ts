import { MutationHookOptions, QueryHookOptions, useMutation, useQuery } from '@apollo/client';

import { PAGE_LIMIT } from '@/constants/limit';
import {
  MutationBatchVerifyProductMappingMutation,
  MutationBatchVerifyProductMappingMutationVariables,
  MutationCancelVerificationMutation,
  MutationCancelVerificationMutationVariables,
  MutationRemoveProductMappingMutation,
  MutationRemoveProductMappingMutationVariables,
  MutationVerifyProductMappingMutation,
  MutationVerifyProductMappingMutationVariables,
  OrderOptionType,
  ProductMappingVerificationStatus,
  QueryPendingVerificationsQuery,
  QueryPendingVerificationsQueryVariables,
  QueryVerificationHistoryQuery,
  QueryVerificationHistoryQueryVariables,
  QueryVerificationStatisticsQuery,
} from '@/generated/gql/graphql';
import {
  MutationBatchVerifyProductMapping,
  MutationCancelVerification,
  MutationRemoveProductMapping,
  MutationVerifyProductMapping,
  QueryPendingVerifications,
  QueryVerificationHistory,
  QueryVerificationStatistics,
} from '@/graphql/verification';

export const useGetPendingVerifications = (
  variables?: Partial<QueryPendingVerificationsQueryVariables>,
  options?: QueryHookOptions<
    QueryPendingVerificationsQuery,
    QueryPendingVerificationsQueryVariables
  >,
) => {
  return useQuery<QueryPendingVerificationsQuery, QueryPendingVerificationsQueryVariables>(
    QueryPendingVerifications,
    {
      variables: {
        limit: variables?.limit ?? PAGE_LIMIT,
        searchAfter: variables?.searchAfter ?? undefined,
        prioritizeOld: variables?.prioritizeOld ?? false,
        orderBy:
          variables?.orderBy ??
          (variables?.prioritizeOld ? OrderOptionType.Asc : OrderOptionType.Desc),
      },
      fetchPolicy: 'network-only',
      ...options,
    },
  );
};

export const useGetVerificationStatistics = (
  options?: QueryHookOptions<QueryVerificationStatisticsQuery>,
) => {
  return useQuery<QueryVerificationStatisticsQuery>(QueryVerificationStatistics, {
    fetchPolicy: 'network-only',
    pollInterval: 30000, // 30초마다 자동 갱신
    ...options,
  });
};

export const useGetVerificationHistory = (
  variables?: Partial<QueryVerificationHistoryQueryVariables>,
  options?: QueryHookOptions<QueryVerificationHistoryQuery, QueryVerificationHistoryQueryVariables>,
) => {
  return useQuery<QueryVerificationHistoryQuery, QueryVerificationHistoryQueryVariables>(
    QueryVerificationHistory,
    {
      variables: {
        limit: variables?.limit ?? PAGE_LIMIT,
        orderBy: variables?.orderBy ?? OrderOptionType.Desc,
        ...variables,
      },
      fetchPolicy: 'network-only',
      ...options,
    },
  );
};

export const useVerifyProductMapping = (
  options?: MutationHookOptions<
    MutationVerifyProductMappingMutation,
    MutationVerifyProductMappingMutationVariables
  >,
) => {
  return useMutation<
    MutationVerifyProductMappingMutation,
    MutationVerifyProductMappingMutationVariables
  >(MutationVerifyProductMapping, {
    refetchQueries: [
      {
        query: QueryVerificationStatistics,
      },
    ],
    // pendingVerifications는 optimistic update로 처리하므로 refetch 제거
    ...options,
  });
};

export const useBatchVerifyProductMapping = (
  options?: MutationHookOptions<
    MutationBatchVerifyProductMappingMutation,
    MutationBatchVerifyProductMappingMutationVariables
  >,
) => {
  return useMutation<
    MutationBatchVerifyProductMappingMutation,
    MutationBatchVerifyProductMappingMutationVariables
  >(MutationBatchVerifyProductMapping, {
    refetchQueries: [
      {
        query: QueryVerificationStatistics,
      },
    ],
    // pendingVerifications는 optimistic update로 처리하므로 refetch 제거
    ...options,
  });
};

export const useRemoveProductMapping = (
  options?: MutationHookOptions<
    MutationRemoveProductMappingMutation,
    MutationRemoveProductMappingMutationVariables
  >,
) => {
  return useMutation<
    MutationRemoveProductMappingMutation,
    MutationRemoveProductMappingMutationVariables
  >(MutationRemoveProductMapping, {
    refetchQueries: [
      {
        query: QueryVerificationStatistics,
      },
    ],
    // pendingVerifications는 optimistic update로 처리하므로 refetch 제거
    ...options,
  });
};

export const useCancelVerification = (
  options?: MutationHookOptions<
    MutationCancelVerificationMutation,
    MutationCancelVerificationMutationVariables
  >,
) => {
  return useMutation<
    MutationCancelVerificationMutation,
    MutationCancelVerificationMutationVariables
  >(MutationCancelVerification, {
    refetchQueries: [
      {
        query: QueryVerificationStatistics,
      },
    ],
    // pendingVerifications는 optimistic update로 처리하므로 refetch 제거
    ...options,
  });
};
