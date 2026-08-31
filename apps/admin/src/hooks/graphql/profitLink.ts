import { MutationHookOptions, QueryHookOptions, useMutation, useQuery } from '@apollo/client';

import {
  MutationIssueTossProfitLink,
  MutationSetThreeHaSession,
  MutationSetTossSession,
  QueryAffiliateSalesTrend,
  QueryHasThreeHaSession,
  QueryHasTossSession,
  QueryProfitLinkErrorStats,
  QueryProfitLinkFunnelDaily,
  QueryProfitLinkMissedProducts,
  QueryProfitLinkProviderHealth,
  QueryProfitLinkQueueHealth,
} from '@/graphql/profitLink';
import {
  AffiliateSalesDailyOutput,
  ProfitLinkErrorCountOutput,
  ProfitLinkFunnelDailyOutput,
  ProfitLinkMissedProductOutput,
  ProfitLinkProviderHealthOutput,
  ProfitLinkQueueHealthOutput,
  TossProfitLinkOutput,
} from '@/types/profitLink';

export const useQueryHasTossSession = (options?: QueryHookOptions<{ hasTossSession: boolean }>) => {
  return useQuery<{ hasTossSession: boolean }>(QueryHasTossSession, {
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useMutationSetTossSession = (
  options?: MutationHookOptions<{ setTossSession: boolean }, { token: string }>,
) => {
  return useMutation<{ setTossSession: boolean }, { token: string }>(MutationSetTossSession, {
    ...options,
  });
};

export const useQueryHasThreeHaSession = (
  options?: QueryHookOptions<{ hasThreeHaSession: boolean }>,
) => {
  return useQuery<{ hasThreeHaSession: boolean }>(QueryHasThreeHaSession, {
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useMutationSetThreeHaSession = (
  options?: MutationHookOptions<{ setThreeHaSession: boolean }, { cookie: string }>,
) => {
  return useMutation<{ setThreeHaSession: boolean }, { cookie: string }>(
    MutationSetThreeHaSession,
    { ...options },
  );
};

export const useMutationIssueTossProfitLink = (
  options?: MutationHookOptions<{ issueTossProfitLink: TossProfitLinkOutput }, { url: string }>,
) => {
  return useMutation<{ issueTossProfitLink: TossProfitLinkOutput }, { url: string }>(
    MutationIssueTossProfitLink,
    { ...options },
  );
};

// ─── 수익링크 대시보드 ───

interface DateRangeVariables {
  startDate: string;
  endDate: string;
}

export const useProfitLinkProviderHealth = () =>
  useQuery<{ profitLinkProviderHealth: ProfitLinkProviderHealthOutput[] }>(
    QueryProfitLinkProviderHealth,
    { fetchPolicy: 'network-only' },
  );

export const useProfitLinkFunnelDaily = (variables: DateRangeVariables) =>
  useQuery<{ profitLinkFunnelDaily: ProfitLinkFunnelDailyOutput[] }, DateRangeVariables>(
    QueryProfitLinkFunnelDaily,
    { variables, fetchPolicy: 'network-only' },
  );

export const useProfitLinkErrorStats = (variables: DateRangeVariables & { limit?: number }) =>
  useQuery<
    { profitLinkErrorStats: ProfitLinkErrorCountOutput[] },
    DateRangeVariables & { limit?: number }
  >(QueryProfitLinkErrorStats, { variables, fetchPolicy: 'network-only' });

export const useProfitLinkMissedProducts = (variables: {
  limit?: number;
  categoryIds?: number[];
}) =>
  useQuery<
    { profitLinkMissedProducts: ProfitLinkMissedProductOutput[] },
    { limit?: number; categoryIds?: number[] }
  >(QueryProfitLinkMissedProducts, { variables, fetchPolicy: 'network-only' });

export const useProfitLinkQueueHealth = () =>
  useQuery<{ profitLinkQueueHealth: ProfitLinkQueueHealthOutput }>(QueryProfitLinkQueueHealth, {
    fetchPolicy: 'network-only',
  });

export const useAffiliateSalesTrend = (variables: DateRangeVariables) =>
  useQuery<{ affiliateSalesTrend: AffiliateSalesDailyOutput[] }, DateRangeVariables>(
    QueryAffiliateSalesTrend,
    { variables, fetchPolicy: 'network-only' },
  );
