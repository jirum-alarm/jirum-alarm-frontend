export interface ProfitLinkProviderHealthOutput {
  provider: string;
  issued24h: number;
  issued7d: number;
  lastIssuedProductAt?: string;
  sales24h: number;
  sales7d: number;
  sales30d: number;
  lastSaleAt?: string;
  commission7d?: number;
}

export interface ProfitLinkFunnelDailyOutput {
  date: string;
  total: number;
  issued: number;
  pending: number;
  parked: number;
  terminal: number;
}

export interface ProfitLinkErrorCountOutput {
  error: string;
  count: number;
}

export interface ProfitLinkMissedProductOutput {
  id: number;
  title: string;
  mallName?: string;
  parsedPrice?: number;
  categoryId: number;
  createdAt: string;
  attempts: number;
  lastError?: string;
  nextRetryAt?: string;
  rankingScore?: number;
  detailUrl?: string;
}

export interface AttemptsCountOutput {
  attempts: number;
  count: number;
}

export interface ProfitLinkQueueHealthOutput {
  eligibleNow: number;
  waitingBackoff: number;
  parked: number;
  terminalDisabled: number;
  oldestEligibleCreatedAt?: string;
  attemptsDistribution: AttemptsCountOutput[];
}

export interface AffiliateSalesDailyOutput {
  date: string;
  provider: string;
  count: number;
  commissionSum: number;
}
