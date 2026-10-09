import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';

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
  QueryPendingVerificationsTotalCountQuery,
  QueryPendingVerificationsTotalCountQueryVariables,
  QueryVerificationHistoryQuery,
  QueryVerificationHistoryQueryVariables,
} from '@/generated/gql/graphql';
import {
  MutationBatchVerifyProductMapping,
  MutationCancelVerification,
  MutationRemoveProductMapping,
  MutationVerifyProductMapping,
  QueryPendingVerifications,
  QueryPendingVerificationsTotalCount,
  QueryVerificationHistory,
} from '@/graphql/verification';

import { QueryOptions } from './options';

export const useGetPendingVerificationsLazy = (
  options?: QueryOptions<QueryPendingVerificationsQuery, QueryPendingVerificationsQueryVariables>,
) => {
  return useLazyQuery<QueryPendingVerificationsQuery, QueryPendingVerificationsQueryVariables>(
    QueryPendingVerifications,
    {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      ...options,
    },
  );
};

export const useGetVerificationHistory = (
  variables?: Partial<QueryVerificationHistoryQueryVariables>,
  options?: QueryOptions<QueryVerificationHistoryQuery, QueryVerificationHistoryQueryVariables>,
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
  options?: useMutation.Options<
    MutationVerifyProductMappingMutation,
    MutationVerifyProductMappingMutationVariables
  >,
) => {
  return useMutation<
    MutationVerifyProductMappingMutation,
    MutationVerifyProductMappingMutationVariables
  >(MutationVerifyProductMapping, {
    // pendingVerifications는 optimistic update로 처리하므로 refetch 제거
    ...options,
  });
};

export const useBatchVerifyProductMapping = (
  options?: useMutation.Options<
    MutationBatchVerifyProductMappingMutation,
    MutationBatchVerifyProductMappingMutationVariables
  >,
) => {
  return useMutation<
    MutationBatchVerifyProductMappingMutation,
    MutationBatchVerifyProductMappingMutationVariables
  >(MutationBatchVerifyProductMapping, {
    // pendingVerifications는 optimistic update로 처리하므로 refetch 제거
    ...options,
  });
};

export const useRemoveProductMapping = (
  options?: useMutation.Options<
    MutationRemoveProductMappingMutation,
    MutationRemoveProductMappingMutationVariables
  >,
) => {
  return useMutation<
    MutationRemoveProductMappingMutation,
    MutationRemoveProductMappingMutationVariables
  >(MutationRemoveProductMapping, {
    // pendingVerifications는 optimistic update로 처리하므로 refetch 제거
    ...options,
  });
};

export const useCancelVerification = (
  options?: useMutation.Options<
    MutationCancelVerificationMutation,
    MutationCancelVerificationMutationVariables
  >,
) => {
  return useMutation<
    MutationCancelVerificationMutation,
    MutationCancelVerificationMutationVariables
  >(MutationCancelVerification, {
    // pendingVerifications는 optimistic update로 처리하므로 refetch 제거
    ...options,
  });
};

export const useGetPendingVerificationsTotalCount = (
  variables?: QueryPendingVerificationsTotalCountQueryVariables,
  options?: QueryOptions<
    QueryPendingVerificationsTotalCountQuery,
    QueryPendingVerificationsTotalCountQueryVariables
  >,
) => {
  return useQuery<
    QueryPendingVerificationsTotalCountQuery,
    QueryPendingVerificationsTotalCountQueryVariables
  >(QueryPendingVerificationsTotalCount, {
    variables: {
      brandProductId: variables?.brandProductId ?? undefined,
      matchStatus: variables?.matchStatus ?? undefined,
      target: variables?.target ?? undefined,
      verificationStatus: variables?.verificationStatus ?? undefined,
      suspiciousFirst: variables?.suspiciousFirst ?? undefined,
    },
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useGetPendingVerificationsTotalCountLazy = () => {
  return useLazyQuery<
    QueryPendingVerificationsTotalCountQuery,
    QueryPendingVerificationsTotalCountQueryVariables
  >(QueryPendingVerificationsTotalCount, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });
};
