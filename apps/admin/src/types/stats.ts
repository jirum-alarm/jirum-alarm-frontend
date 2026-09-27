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
  COMMUNITY = 'community',
  MALL = 'mall',
  DANAWA = 'danawa',
}

export type ProviderHealthOutput = QueryProviderHealthStatusQuery['providerHealthStatus'][number];
