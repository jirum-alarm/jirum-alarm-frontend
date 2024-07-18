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

export interface IProductsRankingOutput {
  products: Pick<IProduct, 'id' | 'title' | 'url' | 'price' | 'thumbnail'>[];
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
