import { QueryHookOptions, useLazyQuery, useQuery } from '@apollo/client';

import {
  QueryDailyServiceViewStats,
  QueryHotDealRatioStats,
  QueryHotDealTypeDistribution,
  QueryProductCountByCategory,
  QueryProductCountByProvider,
  QueryProductPriceDistribution,
  QueryProductRegistrationStats,
  QueryProductRegistrationStatsByProvider,
  QueryProviderHealthStatus,
  QueryThumbnailStats,
  QueryTopFavoriteCategories,
  QueryTopNotificationKeywords,
  QueryUserDemographicStats,
  QueryUserRegistrationStats,
} from '@/graphql/stats';
import {
  CategoryCountOutput,
  DateCountOutput,
  DateInterval,
  HotDealRatioOutput,
  HotDealTypeCountOutput,
  KeywordCountOutput,
  PriceRangeCountOutput,
  ProviderCountOutput,
  ProviderDateCountOutput,
  ProviderHealthOutput,
  ProviderType,
  ThumbnailStatsOutput,
  UserDemographicStatsOutput,
} from '@/types/stats';

// 날짜 범위 쿼리 공통 변수
interface DateRangeVariables {
  startDate: string;
  endDate: string;
  interval: DateInterval;
}

// 1. 사용자 통계

export const useUserRegistrationStats = () => {
  return useLazyQuery<{ userRegistrationStats: DateCountOutput[] }, DateRangeVariables>(
    QueryUserRegistrationStats,
    {
      fetchPolicy: 'network-only',
    },
  );
};

export const useUserDemographicStats = (
  options?: QueryHookOptions<{ userDemographicStats: UserDemographicStatsOutput }>,
) => {
  return useQuery<{ userDemographicStats: UserDemographicStatsOutput }>(QueryUserDemographicStats, {
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useTopFavoriteCategories = (
  variables?: { limit?: number },
  options?: QueryHookOptions<{ topFavoriteCategories: CategoryCountOutput[] }, { limit?: number }>,
) => {
  return useQuery<{ topFavoriteCategories: CategoryCountOutput[] }, { limit?: number }>(
    QueryTopFavoriteCategories,
    {
      variables: { limit: variables?.limit ?? 10 },
      fetchPolicy: 'network-only',
      ...options,
    },
  );
};

// 2. 상품/핫딜 통계

export const useProductRegistrationStats = () => {
  return useLazyQuery<{ productRegistrationStats: DateCountOutput[] }, DateRangeVariables>(
    QueryProductRegistrationStats,
    {
      fetchPolicy: 'network-only',
    },
  );
};

export const useHotDealRatioStats = () => {
  return useLazyQuery<{ hotDealRatioStats: HotDealRatioOutput[] }, DateRangeVariables>(
    QueryHotDealRatioStats,
    {
      fetchPolicy: 'network-only',
    },
  );
};

export const useHotDealTypeDistribution = () => {
  return useLazyQuery<{ hotDealTypeDistribution: HotDealTypeCountOutput[] }, DateRangeVariables>(
    QueryHotDealTypeDistribution,
    {
      fetchPolicy: 'network-only',
    },
  );
};

export const useProductCountByCategory = (
  options?: QueryHookOptions<{ productCountByCategory: CategoryCountOutput[] }>,
) => {
  return useQuery<{ productCountByCategory: CategoryCountOutput[] }>(QueryProductCountByCategory, {
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useProductCountByProvider = (
  options?: QueryHookOptions<{ productCountByProvider: ProviderCountOutput[] }>,
) => {
  return useQuery<{ productCountByProvider: ProviderCountOutput[] }>(QueryProductCountByProvider, {
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useProductPriceDistribution = () => {
  return useLazyQuery<{ productPriceDistribution: PriceRangeCountOutput[] }, DateRangeVariables>(
    QueryProductPriceDistribution,
    {
      fetchPolicy: 'network-only',
    },
  );
};

// 3. 사용자 참여 통계

export const useDailyServiceViewStats = () => {
  return useLazyQuery<{ dailyServiceViewStats: DateCountOutput[] }, DateRangeVariables>(
    QueryDailyServiceViewStats,
    {
      fetchPolicy: 'network-only',
    },
  );
};

export const useTopNotificationKeywords = (
  variables?: { limit?: number; since?: string },
  options?: QueryHookOptions<
    { topNotificationKeywords: KeywordCountOutput[] },
    { limit?: number; since?: string }
  >,
) => {
  return useQuery<
    { topNotificationKeywords: KeywordCountOutput[] },
    { limit?: number; since?: string }
  >(QueryTopNotificationKeywords, {
    variables: { limit: variables?.limit ?? 30, since: variables?.since },
    fetchPolicy: 'network-only',
    ...options,
  });
};

// 4. 크롤링 운영 통계

interface ProviderTypeFilter {
  providerType?: ProviderType;
}

type DateRangeWithProviderFilter = DateRangeVariables & ProviderTypeFilter;

export const useProductRegistrationStatsByProvider = () => {
  return useLazyQuery<
    { productRegistrationStatsByProvider: ProviderDateCountOutput[] },
    DateRangeWithProviderFilter
  >(QueryProductRegistrationStatsByProvider, {
    fetchPolicy: 'network-only',
  });
};

export const useProviderHealthStatus = (
  variables?: ProviderTypeFilter,
  options?: QueryHookOptions<{ providerHealthStatus: ProviderHealthOutput[] }, ProviderTypeFilter>,
) => {
  return useQuery<{ providerHealthStatus: ProviderHealthOutput[] }, ProviderTypeFilter>(
    QueryProviderHealthStatus,
    {
      variables,
      fetchPolicy: 'network-only',
      pollInterval: 60_000,
      ...options,
    },
  );
};

export const useThumbnailStats = () => {
  return useLazyQuery<{ thumbnailStats: ThumbnailStatsOutput }, DateRangeVariables>(
    QueryThumbnailStats,
    {
      fetchPolicy: 'network-only',
    },
  );
};
