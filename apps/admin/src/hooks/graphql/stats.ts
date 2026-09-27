import { QueryHookOptions, useLazyQuery, useQuery } from '@apollo/client';

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
  QueryThumbnailStatsQuery,
  QueryTopFavoriteCategoriesQuery,
  QueryTopFavoriteCategoriesQueryVariables,
  QueryTopNotificationKeywordsQuery,
  QueryTopNotificationKeywordsQueryVariables,
  QueryUserDemographicStatsQuery,
  QueryUserDemographicStatsQueryVariables,
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
  QueryThumbnailStats,
  QueryTopFavoriteCategories,
  QueryTopNotificationKeywords,
  QueryUserDemographicStats,
  QueryUserRegistrationStats,
} from '@/graphql/stats';
import { DateInterval, ProviderType } from '@/types/stats';

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
    },
  );
};

export const useUserDemographicStats = (
  options?: QueryHookOptions<
    QueryUserDemographicStatsQuery,
    QueryUserDemographicStatsQueryVariables
  >,
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
  options?: QueryHookOptions<
    QueryTopFavoriteCategoriesQuery,
    QueryTopFavoriteCategoriesQueryVariables
  >,
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
    },
  );
};

export const useHotDealRatioStats = () => {
  return useLazyQuery<QueryHotDealRatioStatsQuery, DateRangeVariables>(QueryHotDealRatioStats, {
    fetchPolicy: 'network-only',
  });
};

export const useHotDealTypeDistribution = () => {
  return useLazyQuery<QueryHotDealTypeDistributionQuery, DateRangeVariables>(
    QueryHotDealTypeDistribution,
    {
      fetchPolicy: 'network-only',
    },
  );
};

export const useProductCountByCategory = (
  options?: QueryHookOptions<
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
  options?: QueryHookOptions<
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
    },
  );
};

// 3. 사용자 참여 통계

export const useDailyServiceViewStats = () => {
  return useLazyQuery<QueryDailyServiceViewStatsQuery, DateRangeVariables>(
    QueryDailyServiceViewStats,
    {
      fetchPolicy: 'network-only',
    },
  );
};

export const useTopNotificationKeywords = (
  variables?: QueryTopNotificationKeywordsQueryVariables,
  options?: QueryHookOptions<
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
    },
  );
};

export const useProviderHealthStatus = (
  variables?: ProviderTypeFilter,
  options?: QueryHookOptions<QueryProviderHealthStatusQuery, ProviderTypeFilter>,
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
  });
};
