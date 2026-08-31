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

export const QueryHasThreeHaSession = gql`
  query HasThreeHaSession {
    hasThreeHaSession
  }
`;

export const MutationSetThreeHaSession = gql`
  mutation SetThreeHaSession($cookie: String!) {
    setThreeHaSession(cookie: $cookie)
  }
`;

export const MutationIssueTossProfitLink = gql`
  mutation IssueTossProfitLink($url: String!) {
    issueTossProfitLink(url: $url) {
      profitLink
      error
    }
  }
`;

export const QueryHasOhouSession = gql`
  query HasOhouSession {
    hasOhouSession
  }
`;

export const MutationSetOhouSession = gql`
  mutation SetOhouSession($curl: String!) {
    setOhouSession(curl: $curl)
  }
`;

export const MutationIssueOhouProfitLink = gql`
  mutation IssueOhouProfitLink($url: String!) {
    issueOhouProfitLink(url: $url) {
      profitLink
      error
    }
  }
`;

export const QueryHasKakaoSession = gql`
  query HasKakaoSession {
    hasKakaoSession
  }
`;

export const MutationSetKakaoSession = gql`
  mutation SetKakaoSession($curl: String!) {
    setKakaoSession(curl: $curl)
  }
`;

export const MutationIssueKakaoProfitLink = gql`
  mutation IssueKakaoProfitLink($url: String!) {
    issueKakaoProfitLink(url: $url) {
      profitLink
      error
    }
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
