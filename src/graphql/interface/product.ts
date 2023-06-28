import { IProvider } from "./provider";

export interface IProduct {
  id: number;
  title: string;
  provider: IProvider;
  mallId?: number;
  url: string;
  providerId: number;
  category?: string;
  categoryId?: number;
  searchAfter?: string[];
}

export interface IProductOutput {
  products: IProduct[];
}
