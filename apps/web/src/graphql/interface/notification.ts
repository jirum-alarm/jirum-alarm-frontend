import { IProduct } from './product';

export interface INotification {
  id: string;
  readAt: Date | null;
  createdAt: Date;

  /**
   * @deprecated Use `product` instead.
   */
  message?: string;
  /**
   * @deprecated Use `product` instead.
   */
  url?: string;

  product: IProduct;
}

export enum Role {
  USER,
  ADMIN,
}

export type UnreadNotificationsCount = number;

export enum TokenType {
  FCM = 'FCM',
  APNS = 'APNS',
}

export type addPushTokenVariable = {
  token: string;
  tokenType: TokenType;
};
