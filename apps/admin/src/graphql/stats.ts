import { gql } from '@apollo/client';

// 1. 사용자 통계
export const QueryUserRegistrationStats = gql`
  query QueryUserRegistrationStats(
    $startDate: DateTime!
    $endDate: DateTime!
    $interval: DateInterval!
  ) {
    userRegistrationStats(startDate: $startDate, endDate: $endDate, interval: $interval) {
      date
      count
    }
  }
`;

export const QueryUserDemographicStats = gql`
  query QueryUserDemographicStats {
    userDemographicStats {
      genderDistribution {
        gender
        count
      }
      ageDistribution {
        ageGroup
        count
      }
    }
  }
`;

export const QueryTopFavoriteCategories = gql`
  query QueryTopFavoriteCategories($limit: Int) {
    topFavoriteCategories(limit: $limit) {
      categoryId
      categoryName
      count
    }
  }
`;

// 2. 상품/핫딜 통계
export const QueryProductRegistrationStats = gql`
  query QueryProductRegistrationStats(
    $startDate: DateTime!
    $endDate: DateTime!
    $interval: DateInterval!
  ) {
    productRegistrationStats(startDate: $startDate, endDate: $endDate, interval: $interval) {
      date
      count
    }
  }
`;

export const QueryHotDealRatioStats = gql`
  query QueryHotDealRatioStats(
    $startDate: DateTime!
    $endDate: DateTime!
    $interval: DateInterval!
  ) {
    hotDealRatioStats(startDate: $startDate, endDate: $endDate, interval: $interval) {
      date
      totalCount
      hotDealCount
      ratio
    }
  }
`;

export const QueryHotDealTypeDistribution = gql`
  query QueryHotDealTypeDistribution(
    $startDate: DateTime!
    $endDate: DateTime!
    $interval: DateInterval!
  ) {
    hotDealTypeDistribution(startDate: $startDate, endDate: $endDate, interval: $interval) {
      hotDealType
      count
    }
  }
`;

export const QueryProductCountByCategory = gql`
  query QueryProductCountByCategory {
    productCountByCategory {
      categoryId
      categoryName
      count
    }
  }
`;

export const QueryProductCountByProvider = gql`
  query QueryProductCountByProvider {
    productCountByProvider {
      providerId
      providerName
      count
    }
  }
`;

export const QueryProductPriceDistribution = gql`
  query QueryProductPriceDistribution(
    $startDate: DateTime!
    $endDate: DateTime!
    $interval: DateInterval!
  ) {
    productPriceDistribution(startDate: $startDate, endDate: $endDate, interval: $interval) {
      priceRange
      minPrice
      maxPrice
      count
    }
  }
`;

// 3. 사용자 참여 통계
export const QueryDailyServiceViewStats = gql`
  query QueryDailyServiceViewStats(
    $startDate: DateTime!
    $endDate: DateTime!
    $interval: DateInterval!
  ) {
    dailyServiceViewStats(startDate: $startDate, endDate: $endDate, interval: $interval) {
      date
      count
    }
  }
`;

export const QueryTopNotificationKeywords = gql`
  query QueryTopNotificationKeywords($limit: Int, $since: DateTime) {
    topNotificationKeywords(limit: $limit, since: $since) {
      keyword
      count
    }
  }
`;
