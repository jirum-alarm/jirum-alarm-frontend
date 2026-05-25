export enum DateInterval {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export interface DateCountOutput {
  date: string;
  count: number;
}

export interface GenderDistribution {
  gender: string;
  count: number;
}

export interface AgeDistribution {
  ageGroup: string;
  count: number;
}

export interface UserDemographicStatsOutput {
  genderDistribution: GenderDistribution[];
  ageDistribution: AgeDistribution[];
}

export interface CategoryCountOutput {
  categoryId: number;
  categoryName: string;
  count: number;
}

export interface HotDealRatioOutput {
  date: string;
  totalCount: number;
  hotDealCount: number;
  ratio: number;
}

export interface HotDealTypeCountOutput {
  hotDealType: string;
  count: number;
}

export interface ProviderCountOutput {
  providerId: number;
  providerName: string;
  count: number;
}

export interface PriceRangeCountOutput {
  priceRange: string;
  minPrice: number;
  maxPrice: number;
  count: number;
}

export interface KeywordCountOutput {
  keyword: string;
  count: number;
}

export enum ProviderType {
  COMMUNITY = 'community',
  MALL = 'mall',
  DANAWA = 'danawa',
}

export interface ProviderDateCountOutput {
  date: string;
  providerId: number;
  providerName: string;
  count: number;
}

export interface ProviderHealthOutput {
  providerId: number;
  providerName: string;
  providerType: ProviderType;
  last1hCount: number;
  last24hCount: number;
  last7dCount: number;
  latestCollectedAt?: string | null;
  minutesSinceLatest?: number | null;
}

export interface ThumbnailTypeCountOutput {
  thumbnailType?: string | null;
  count: number;
}

export interface ThumbnailMallCountOutput {
  mallName: string;
  count: number;
}

export interface ThumbnailStatsOutput {
  typeDistribution: ThumbnailTypeCountOutput[];
  mallDistribution: ThumbnailMallCountOutput[];
  missingCount: number;
  totalCount: number;
}
