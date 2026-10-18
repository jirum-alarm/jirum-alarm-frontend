import { useLazyQuery, useQuery } from '@apollo/client/react';

import {
  QueryDailyServiceViewStatsQuery,
  QueryHotDealRatioStatsQuery,
  QueryHotDealTypeDistributionQuery,
  QueryProductCountByCategoryQuery,
  QueryProductCountByCategoryQueryVariables,
  QueryProductCountByProviderQuery,
  QueryProductCountByProviderQueryVariables,
  QueryProductPriceDistributionQuery,
  QueryProductRegistrationStatsByProviderQuery,
  QueryProductRegistrationStatsQuery,
  QueryProviderHealthStatusQuery,
  QuerySearchProbeQuery,
  QuerySearchProbeQueryVariables,
  QueryServiceHealthSignalsQuery,
  QueryServiceHealthSignalsQueryVariables,
  QueryThumbnailStatsQuery,
  QueryThumbnailStatsQueryVariables,
  QueryTopFavoriteCategoriesQuery,
  QueryTopFavoriteCategoriesQueryVariables,
  QueryTopNotificationKeywordsQuery,
  QueryTopNotificationKeywordsQueryVariables,
  QueryUserDemographicStatsQuery,
  QueryUserDemographicStatsQueryVariables,
  QueryUserOverviewQuery,
  QueryUserOverviewQueryVariables,
  QueryUserRegistrationStatsQuery,
} from '@/generated/gql/graphql';
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
  QuerySearchProbe,
  QueryServiceHealthSignals,
  QueryThumbnailStats,
  QueryTopFavoriteCategories,
  QueryTopNotificationKeywords,
  QueryUserDemographicStats,
  QueryUserOverview,
  QueryUserRegistrationStats,
} from '@/graphql/stats';
import { DateInterval, ProviderType } from '@/types/stats';

import { QueryOptions } from './options';

// 날짜 범위 쿼리 공통 변수 — interval/providerType 은 화면이 쓰는 로컬 enum(@/types/stats)이라
// 생성된 *QueryVariables 대신 손으로 둔다 (생성 enum 과 멤버 이름이 달라 서로 대입되지 않는다)
interface DateRangeVariables {
  startDate: string;
  endDate: string;
  interval: DateInterval;
}

// 1. 사용자 통계

export const useUserRegistrationStats = () => {
  return useLazyQuery<QueryUserRegistrationStatsQuery, DateRangeVariables>(
    QueryUserRegistrationStats,
    {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );
};

export const useUserOverview = (
  variables: QueryUserOverviewQueryVariables,
  options?: QueryOptions<QueryUserOverviewQuery, QueryUserOverviewQueryVariables>,
) =>
  useQuery<QueryUserOverviewQuery, QueryUserOverviewQueryVariables>(QueryUserOverview, {
    variables,
    fetchPolicy: 'network-only',
    ...options,
  });

export const useUserDemographicStats = (
  options?: QueryOptions<QueryUserDemographicStatsQuery, QueryUserDemographicStatsQueryVariables>,
) => {
  return useQuery<QueryUserDemographicStatsQuery, QueryUserDemographicStatsQueryVariables>(
    QueryUserDemographicStats,
    {
      fetchPolicy: 'network-only',
      ...options,
    },
  );
};

export const useTopFavoriteCategories = (
  variables?: QueryTopFavoriteCategoriesQueryVariables,
  options?: QueryOptions<QueryTopFavoriteCategoriesQuery, QueryTopFavoriteCategoriesQueryVariables>,
) => {
  return useQuery<QueryTopFavoriteCategoriesQuery, QueryTopFavoriteCategoriesQueryVariables>(
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
  return useLazyQuery<QueryProductRegistrationStatsQuery, DateRangeVariables>(
    QueryProductRegistrationStats,
    {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );
};

export const useHotDealRatioStats = () => {
  return useLazyQuery<QueryHotDealRatioStatsQuery, DateRangeVariables>(QueryHotDealRatioStats, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });
};

export const useHotDealTypeDistribution = () => {
  return useLazyQuery<QueryHotDealTypeDistributionQuery, DateRangeVariables>(
    QueryHotDealTypeDistribution,
    {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );
};

export const useProductCountByCategory = (
  options?: QueryOptions<
    QueryProductCountByCategoryQuery,
    QueryProductCountByCategoryQueryVariables
  >,
) => {
  return useQuery<QueryProductCountByCategoryQuery, QueryProductCountByCategoryQueryVariables>(
    QueryProductCountByCategory,
    {
      fetchPolicy: 'network-only',
      ...options,
    },
  );
};

export const useProductCountByProvider = (
  options?: QueryOptions<
    QueryProductCountByProviderQuery,
    QueryProductCountByProviderQueryVariables
  >,
) => {
  return useQuery<QueryProductCountByProviderQuery, QueryProductCountByProviderQueryVariables>(
    QueryProductCountByProvider,
    {
      fetchPolicy: 'network-only',
      ...options,
    },
  );
};

export const useProductPriceDistribution = () => {
  return useLazyQuery<QueryProductPriceDistributionQuery, DateRangeVariables>(
    QueryProductPriceDistribution,
    {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );
};

// 3. 사용자 참여 통계

export const useDailyServiceViewStats = () => {
  return useLazyQuery<QueryDailyServiceViewStatsQuery, DateRangeVariables>(
    QueryDailyServiceViewStats,
    {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );
};

export const useTopNotificationKeywords = (
  variables?: QueryTopNotificationKeywordsQueryVariables,
  options?: QueryOptions<
    QueryTopNotificationKeywordsQuery,
    QueryTopNotificationKeywordsQueryVariables
  >,
) => {
  return useQuery<QueryTopNotificationKeywordsQuery, QueryTopNotificationKeywordsQueryVariables>(
    QueryTopNotificationKeywords,
    {
      variables: { limit: variables?.limit ?? 30, since: variables?.since },
      fetchPolicy: 'network-only',
      ...options,
    },
  );
};

// 4. 크롤링 운영 통계

interface ProviderTypeFilter {
  providerType?: ProviderType;
}

type DateRangeWithProviderFilter = DateRangeVariables & ProviderTypeFilter;

export const useProductRegistrationStatsByProvider = () => {
  return useLazyQuery<QueryProductRegistrationStatsByProviderQuery, DateRangeWithProviderFilter>(
    QueryProductRegistrationStatsByProvider,
    {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );
};

export const useProviderHealthStatus = (
  variables?: ProviderTypeFilter,
  options?: QueryOptions<QueryProviderHealthStatusQuery, ProviderTypeFilter>,
) => {
  return useQuery<QueryProviderHealthStatusQuery, ProviderTypeFilter>(QueryProviderHealthStatus, {
    variables,
    fetchPolicy: 'network-only',
    pollInterval: 60_000,
    ...options,
  });
};

export const useThumbnailStats = () => {
  return useLazyQuery<QueryThumbnailStatsQuery, DateRangeVariables>(QueryThumbnailStats, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });
};

// 점검 화면용 — 지금 상태를 보는 거라 캐시를 쓰지 않는다
export const useThumbnailStatsNow = (variables: QueryThumbnailStatsQueryVariables) =>
  useQuery<QueryThumbnailStatsQuery, QueryThumbnailStatsQueryVariables>(QueryThumbnailStats, {
    variables,
    fetchPolicy: 'network-only',
  });

export const useSearchProbe = (
  keyword: string,
  options?: QueryOptions<QuerySearchProbeQuery, QuerySearchProbeQueryVariables>,
) =>
  useQuery<QuerySearchProbeQuery, QuerySearchProbeQueryVariables>(QuerySearchProbe, {
    variables: { keyword },
    fetchPolicy: 'network-only',
    ...options,
  });

export const useServiceHealthSignals = (
  options?: QueryOptions<QueryServiceHealthSignalsQuery, QueryServiceHealthSignalsQueryVariables>,
) =>
  useQuery<QueryServiceHealthSignalsQuery, QueryServiceHealthSignalsQueryVariables>(
    QueryServiceHealthSignals,
    {
      fetchPolicy: 'network-only',
      ...options,
    },
  );
