import { IProduct } from './product';

export interface INotification {
  id: string;
  readAt: Date | null;
  createdAt: Date;
  message: string;
  url: string;
  keyword: string;
  product: IProduct | null;
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
