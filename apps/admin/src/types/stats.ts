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
