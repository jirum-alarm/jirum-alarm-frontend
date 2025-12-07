import { HotDealType } from '@shared/api/gql/graphql';

import { IProvider } from './provider';

export const enum ProductPriceTarget {
  JIRUM_ALARM = 'JIRUM_ALARM',
  MALL = 'MALL',
  DANAWA = 'DANAWA',
}

export const enum CurrencyType {
  WON = 'WON',
  DOLLAR = 'DOLLAR',
}

export const enum ProductThumbnailType {
  POST = 'POST',
  MALL = 'MALL',
}

export interface IProductPrice {
  id: number;
  target: ProductPriceTarget;
  type: CurrencyType;
  price: number;
  createdAt: Date;
}

export interface IProductGuide {
  id: number;
  title: string;
  content: string;
}

export interface IProduct {
  id: string;
  title: string;
  mallId?: number | null;
  url?: string | null;
  isHot?: boolean | null;
  isEnd?: boolean | null;
  price?: string | null;
  providerId: number;
  categoryId?: number | null;
  category?: string | null;
  thumbnail?: string | null;
  hotDealType?: HotDealType | null;
  searchAfter?: Array<string> | null;
  postedAt: Date;
  provider: IProvider;

  detailUrl?: string;
  wishlistCount?: number;
  positiveCommunityReactionCount?: number;
  negativeCommunityReactionCount?: number;
  viewCount?: number;
  mallName?: string;
  guides?: IProductGuide[];
  prices?: IProductPrice[];
  isMyWishlist?: boolean;
  categoryName?: string;
  author?: string;
}

export interface IProductOutput {
  products: IProduct[];
}

export interface IRankingProductsOutput {
  rankingProducts: Pick<IProduct, 'id' | 'title' | 'url' | 'price' | 'thumbnail'>[];
}

export interface CommunityRandomRankingProductsOutPut {
  communityRandomRankingProducts: IProduct[];
}

export enum ProductOrderType {
  ID = 'ID',
  POSTED_AT = 'POSTED_AT',
  COMMENT_COUNT = 'COMMENT_COUNT',
  COMMUNITY_RANKING = 'COMMUNITY_RANKING',
}

export enum OrderOptionType {
  ASC = 'ASC',
  DESC = 'DESC',
}
