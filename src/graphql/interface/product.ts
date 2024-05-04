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
