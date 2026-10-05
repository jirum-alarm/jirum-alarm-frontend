import { MutationHookOptions, QueryHookOptions, useMutation, useQuery } from '@apollo/client';

import {
  AffiliateSalesTrendQuery,
  AffiliateSalesTrendQueryVariables,
  HasKakaoSessionQuery,
  HasKakaoSessionQueryVariables,
  HasOhouSessionQuery,
  HasOhouSessionQueryVariables,
  HasThreeHaSessionQuery,
  HasThreeHaSessionQueryVariables,
  HasTossSessionQuery,
  HasTossSessionQueryVariables,
  IssueKakaoProfitLinkMutation,
  IssueKakaoProfitLinkMutationVariables,
  IssueOhouProfitLinkMutation,
  IssueOhouProfitLinkMutationVariables,
  IssueTossProfitLinkMutation,
  IssueTossProfitLinkMutationVariables,
  ProfitLinkErrorStatsQuery,
  ProfitLinkErrorStatsQueryVariables,
  ProfitLinkFunnelDailyQuery,
  ProfitLinkFunnelDailyQueryVariables,
  ProfitLinkMissedProductsQuery,
  ProfitLinkMissedProductsQueryVariables,
  ProfitLinkProviderHealthQuery,
  ProfitLinkProviderHealthQueryVariables,
  ProfitLinkQueueHealthQuery,
  ProfitLinkQueueHealthQueryVariables,
  RevenueTrendQuery,
  RevenueTrendQueryVariables,
  SetKakaoSessionMutation,
  SetKakaoSessionMutationVariables,
  SetOhouSessionMutation,
  SetOhouSessionMutationVariables,
  SetThreeHaSessionMutation,
  SetThreeHaSessionMutationVariables,
  SetTossSessionMutation,
  SetTossSessionMutationVariables,
} from '@/generated/gql/graphql';
import {
  MutationIssueKakaoProfitLink,
  MutationIssueOhouProfitLink,
  MutationIssueTossProfitLink,
  MutationSetKakaoSession,
  MutationSetOhouSession,
  MutationSetThreeHaSession,
  MutationSetTossSession,
  QueryAffiliateSalesTrend,
  QueryHasKakaoSession,
  QueryHasOhouSession,
  QueryHasThreeHaSession,
  QueryHasTossSession,
  QueryProfitLinkErrorStats,
  QueryProfitLinkFunnelDaily,
  QueryProfitLinkMissedProducts,
  QueryProfitLinkProviderHealth,
  QueryProfitLinkQueueHealth,
  QueryRevenueTrend,
} from '@/graphql/profitLink';

export const useQueryHasTossSession = (
  options?: QueryHookOptions<HasTossSessionQuery, HasTossSessionQueryVariables>,
) => {
  return useQuery<HasTossSessionQuery, HasTossSessionQueryVariables>(QueryHasTossSession, {
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useMutationSetTossSession = (
  options?: MutationHookOptions<SetTossSessionMutation, SetTossSessionMutationVariables>,
) => {
  return useMutation<SetTossSessionMutation, SetTossSessionMutationVariables>(
    MutationSetTossSession,
    {
      ...options,
    },
  );
};

export const useQueryHasThreeHaSession = (
  options?: QueryHookOptions<HasThreeHaSessionQuery, HasThreeHaSessionQueryVariables>,
) => {
  return useQuery<HasThreeHaSessionQuery, HasThreeHaSessionQueryVariables>(QueryHasThreeHaSession, {
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useMutationSetThreeHaSession = (
  options?: MutationHookOptions<SetThreeHaSessionMutation, SetThreeHaSessionMutationVariables>,
) => {
  return useMutation<SetThreeHaSessionMutation, SetThreeHaSessionMutationVariables>(
    MutationSetThreeHaSession,
    { ...options },
  );
};

export const useMutationIssueTossProfitLink = (
  options?: MutationHookOptions<IssueTossProfitLinkMutation, IssueTossProfitLinkMutationVariables>,
) => {
  return useMutation<IssueTossProfitLinkMutation, IssueTossProfitLinkMutationVariables>(
    MutationIssueTossProfitLink,
    { ...options },
  );
};

export const useQueryHasOhouSession = (
  options?: QueryHookOptions<HasOhouSessionQuery, HasOhouSessionQueryVariables>,
) => {
  return useQuery<HasOhouSessionQuery, HasOhouSessionQueryVariables>(QueryHasOhouSession, {
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useMutationSetOhouSession = (
  options?: MutationHookOptions<SetOhouSessionMutation, SetOhouSessionMutationVariables>,
) => {
  return useMutation<SetOhouSessionMutation, SetOhouSessionMutationVariables>(
    MutationSetOhouSession,
    {
      ...options,
    },
  );
};

export const useMutationIssueOhouProfitLink = (
  options?: MutationHookOptions<IssueOhouProfitLinkMutation, IssueOhouProfitLinkMutationVariables>,
) => {
  return useMutation<IssueOhouProfitLinkMutation, IssueOhouProfitLinkMutationVariables>(
    MutationIssueOhouProfitLink,
    { ...options },
  );
};

export const useQueryHasKakaoSession = (
  options?: QueryHookOptions<HasKakaoSessionQuery, HasKakaoSessionQueryVariables>,
) => {
  return useQuery<HasKakaoSessionQuery, HasKakaoSessionQueryVariables>(QueryHasKakaoSession, {
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useMutationSetKakaoSession = (
  options?: MutationHookOptions<SetKakaoSessionMutation, SetKakaoSessionMutationVariables>,
) => {
  return useMutation<SetKakaoSessionMutation, SetKakaoSessionMutationVariables>(
    MutationSetKakaoSession,
    {
      ...options,
    },
  );
};

export const useMutationIssueKakaoProfitLink = (
  options?: MutationHookOptions<
    IssueKakaoProfitLinkMutation,
    IssueKakaoProfitLinkMutationVariables
  >,
) => {
  return useMutation<IssueKakaoProfitLinkMutation, IssueKakaoProfitLinkMutationVariables>(
    MutationIssueKakaoProfitLink,
    { ...options },
  );
};

// ─── 수익링크 대시보드 ───

export const useProfitLinkProviderHealth = () =>
  useQuery<ProfitLinkProviderHealthQuery, ProfitLinkProviderHealthQueryVariables>(
    QueryProfitLinkProviderHealth,
    { fetchPolicy: 'network-only' },
  );

export const useProfitLinkFunnelDaily = (variables: ProfitLinkFunnelDailyQueryVariables) =>
  useQuery<ProfitLinkFunnelDailyQuery, ProfitLinkFunnelDailyQueryVariables>(
    QueryProfitLinkFunnelDaily,
    { variables, fetchPolicy: 'network-only' },
  );

export const useProfitLinkErrorStats = (variables: ProfitLinkErrorStatsQueryVariables) =>
  useQuery<ProfitLinkErrorStatsQuery, ProfitLinkErrorStatsQueryVariables>(
    QueryProfitLinkErrorStats,
    { variables, fetchPolicy: 'network-only' },
  );

export const useProfitLinkMissedProducts = (variables: ProfitLinkMissedProductsQueryVariables) =>
  useQuery<ProfitLinkMissedProductsQuery, ProfitLinkMissedProductsQueryVariables>(
    QueryProfitLinkMissedProducts,
    { variables, fetchPolicy: 'network-only' },
  );

export const useProfitLinkQueueHealth = () =>
  useQuery<ProfitLinkQueueHealthQuery, ProfitLinkQueueHealthQueryVariables>(
    QueryProfitLinkQueueHealth,
    {
      fetchPolicy: 'network-only',
    },
  );

export const useAffiliateSalesTrend = (variables: AffiliateSalesTrendQueryVariables) =>
  useQuery<AffiliateSalesTrendQuery, AffiliateSalesTrendQueryVariables>(QueryAffiliateSalesTrend, {
    variables,
    fetchPolicy: 'network-only',
  });

export const useRevenueTrend = (variables: RevenueTrendQueryVariables) =>
  useQuery<RevenueTrendQuery, RevenueTrendQueryVariables>(QueryRevenueTrend, {
    variables,
    fetchPolicy: 'network-only',
  });
