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
  providerId: number;
  category?: string;
  categoryId?: number;
  mallId?: number;
  title: string;
  url: string;
  detailUrl: string;
  isHot: boolean;
  isEnd: boolean;
  price: string;
  postedAt: Date;
  thumbnail?: string;
  wishlistCount?: number;
  positiveCommunityReactionCount?: number;
  negativeCommunityReactionCount?: number;
  provider: IProvider;
  viewCount?: number;
  mallName?: string;
  guides?: IProductGuide[];
  prices?: IProductPrice[];
  searchAfter?: string[];
  isMyWishlist: boolean;
  categoryName?: string;
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
