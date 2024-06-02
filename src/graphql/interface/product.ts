import { IProvider } from './provider';

export interface IProduct {
  id: number;
  title: string;
  provider: IProvider;
  mallId?: number;
  url: string;
  isHot: boolean;
  isEnd: boolean;
  ship: string;
  price: string;
  providerId: number;
  thumbnail?: string;
  category?: string;
  categoryId?: number;
  searchAfter?: string[];
  postedAt: Date;
}

export interface IProductOutput {
  products: IProduct[];
}

export interface CommunityRandomRankingProductsOutPut {
  communityRandomRankingProducts: IProduct[];
}

export enum ProductOrderType {
  ID = 'ID',
  POSTED_AT = 'POSTED_AT',
  COMMENT_COUNT = 'COMMENT_COUNT',
  COMMUNITY_RANKING = 'COMMUNITY_RANKING',
  COMMUNITY_RANKING_RANDOM = 'COMMUNITY_RANKING_RANDOM',
}

export enum OrderOptionType {
  ASC = 'ASC',
  DESC = 'DESC',
}
