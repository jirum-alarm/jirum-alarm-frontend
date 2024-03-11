export interface INotification {
  id: string;
  groupId: number;
  receiverId: number;
  senderId: number;
  senderType: Role;
  target: string;
  targetId?: string;
  title?: string;
  message: string;
  url?: string;
  category: string;
  readAt?: Date;
  createdAt: Date;
}

export enum Role {
  USER,
  ADMIN,
}

export type UnreadNotificationsCount = number;

export enum TokenType {
  FCM,
  APNS,
}

export type addPushTokenVariable = {
  token: string;
  tokenType: TokenType;
};
