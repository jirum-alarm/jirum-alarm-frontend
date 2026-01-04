import {
  MutationHookOptions,
  QueryHookOptions,
  useLazyQuery,
  useMutation,
  useQuery,
} from '@apollo/client';

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
  ProductMappingMatchStatus,
  ProductMappingTarget,
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
  QueryPendingVerificationsTotalCount,
  QueryVerificationHistory,
  QueryVerificationStatistics,
} from '@/graphql/verification';

export const useGetPendingVerifications = (
  variables?: Partial<QueryPendingVerificationsQueryVariables> & { brandProductId?: number },
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
        brandProductId: variables?.brandProductId ?? undefined,
      },
      fetchPolicy: 'network-only',
      ...options,
    },
  );
};

export const useGetPendingVerificationsLazy = (
  options?: QueryHookOptions<
    QueryPendingVerificationsQuery,
    QueryPendingVerificationsQueryVariables
  >,
) => {
  return useLazyQuery<QueryPendingVerificationsQuery, QueryPendingVerificationsQueryVariables>(
    QueryPendingVerifications,
    {
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

// TotalCount 쿼리 타입 정의
export interface QueryPendingVerificationsTotalCountQuery {
  pendingVerificationsTotalCount: number;
}

export interface QueryPendingVerificationsTotalCountQueryVariables {
  brandProductId?: number;
  matchStatus?: ProductMappingMatchStatus[];
  target?: ProductMappingTarget;
  verificationStatus?: ProductMappingVerificationStatus[];
}

export const useGetPendingVerificationsTotalCount = (
  variables?: QueryPendingVerificationsTotalCountQueryVariables,
  options?: QueryHookOptions<
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
  });
};
