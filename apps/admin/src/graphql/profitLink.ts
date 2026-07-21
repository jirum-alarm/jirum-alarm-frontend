import { gql } from '@apollo/client';

export const QueryHasTossSession = gql`
  query HasTossSession {
    hasTossSession
  }
`;

export const MutationSetTossSession = gql`
  mutation SetTossSession($token: String!) {
    setTossSession(token: $token)
  }
`;

// ─── 수익링크 대시보드 ───

export const QueryProfitLinkProviderHealth = gql`
  query ProfitLinkProviderHealth {
    profitLinkProviderHealth {
      provider
      issued24h
      issued7d
      lastIssuedProductAt
      sales24h
      sales7d
      sales30d
      lastSaleAt
      commission7d
    }
  }
`;

export const QueryProfitLinkFunnelDaily = gql`
  query ProfitLinkFunnelDaily($startDate: DateTime!, $endDate: DateTime!) {
    profitLinkFunnelDaily(startDate: $startDate, endDate: $endDate) {
      date
      total
      issued
      pending
      parked
      terminal
    }
  }
`;

export const QueryProfitLinkErrorStats = gql`
  query ProfitLinkErrorStats($startDate: DateTime!, $endDate: DateTime!, $limit: Int) {
    profitLinkErrorStats(startDate: $startDate, endDate: $endDate, limit: $limit) {
      error
      count
    }
  }
`;

export const QueryProfitLinkMissedProducts = gql`
  query ProfitLinkMissedProducts($limit: Int, $categoryIds: [Int!]) {
    profitLinkMissedProducts(limit: $limit, categoryIds: $categoryIds) {
      id
      title
      mallName
      parsedPrice
      categoryId
      createdAt
      attempts
      lastError
      nextRetryAt
      rankingScore
      detailUrl
    }
  }
`;

export const QueryProfitLinkQueueHealth = gql`
  query ProfitLinkQueueHealth {
    profitLinkQueueHealth {
      eligibleNow
      waitingBackoff
      parked
      terminalDisabled
      oldestEligibleCreatedAt
      attemptsDistribution {
        attempts
        count
      }
    }
  }
`;

export const QueryAffiliateSalesTrend = gql`
  query AffiliateSalesTrend($startDate: DateTime!, $endDate: DateTime!) {
    affiliateSalesTrend(startDate: $startDate, endDate: $endDate) {
      date
      provider
      count
      commissionSum
    }
  }
`;
