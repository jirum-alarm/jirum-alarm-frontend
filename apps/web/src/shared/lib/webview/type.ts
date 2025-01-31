export enum WebViewEventType {
  'TOKEN_REFRESH' = 'TOKEN_REFRESH',
}
export type WebViewEventPayloads = {
  [WebViewEventType.TOKEN_REFRESH]: { data: string };
};
export interface WebViewEvent<T extends WebViewEventType> {
  type: T;
  payload: WebViewEventPayloads[T];
}
