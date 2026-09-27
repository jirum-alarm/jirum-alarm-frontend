import {
  QueryProviderHealthStatusQuery,
  QueryUserRegistrationStatsQuery,
} from '@/generated/gql/graphql';

export enum DateInterval {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export type DateCountOutput = QueryUserRegistrationStatsQuery['userRegistrationStats'][number];

export enum ProviderType {
  COMMUNITY = 'COMMUNITY',
  MALL = 'MALL',
  DANAWA = 'DANAWA',
}

export type ProviderHealthOutput = QueryProviderHealthStatusQuery['providerHealthStatus'][number];
