export enum WebViewEventType {
  'TOKEN_REFRESH' = 'TOKEN_REFRESH',
  'LOGIN_SUCCESS' = 'LOGIN_SUCCESS',
  'TOKEN_REMOVE' = 'TOKEN_REMOVE',
  'PRESS_BACKBUTTON' = 'PRESS_BACKBUTTON',
  'ROUTE_CHANGED' = 'ROUTE_CHANGED',
}
export type WebViewEventPayloads = {
  [WebViewEventType.TOKEN_REFRESH]: { data: string };
  [WebViewEventType.LOGIN_SUCCESS]: {
    data: { accessToken: string; refreshToken: string };
  };
  [WebViewEventType.TOKEN_REMOVE]: null;
  [WebViewEventType.PRESS_BACKBUTTON]: null;
  [WebViewEventType.ROUTE_CHANGED]: { data: { url: string } };
};
export interface WebViewEvent<T extends WebViewEventType> {
  type: T;
  payload: WebViewEventPayloads[T];
}
export enum WebViewReceiverEventType {
  'TOKEN_REFRESH' = 'TOKEN_REFRESH',
}
export type WebViewReceiverEventPayloads = {
  [WebViewReceiverEventType.TOKEN_REFRESH]: { data: string };
};
export interface WebViewReceiverEvent<T extends WebViewReceiverEventType> {
  type: T;
  payload: WebViewReceiverEventPayloads[T];
}
