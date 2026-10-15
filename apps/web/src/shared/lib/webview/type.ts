export enum WebViewEventType {
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  TOKEN_REMOVE = 'TOKEN_REMOVE',
  PRESS_BACKBUTTON = 'PRESS_BACKBUTTON',
  ROUTE_CHANGED = 'ROUTE_CHANGED',
  NOTIFICATION_READ = 'NOTIFICATION_READ',
  HAPTIC_FEEDBACK = 'HAPTIC_FEEDBACK',
  SHARE_REQUEST = 'SHARE_REQUEST',
  ALARM_DOT_CHANGED = 'ALARM_DOT_CHANGED',
  CHANNEL_TALK_VISIBILITY = 'CHANNEL_TALK_VISIBILITY',
  /** 글쓰기 폼에 쓰던 내용이 있나 — 앱 글쓰기 화면이 나가기 전에 묻는다(apps/mobile CommunityWriteScreen). */
  WRITE_DRAFT_CHANGED = 'WRITE_DRAFT_CHANGED',
}

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export type WebViewEventPayloads = {
  [WebViewEventType.TOKEN_REFRESH]: { data: string };
  [WebViewEventType.LOGIN_SUCCESS]: {
    data: { accessToken: string; refreshToken: string };
  };
  [WebViewEventType.TOKEN_REMOVE]: null;
  [WebViewEventType.PRESS_BACKBUTTON]: null;
  [WebViewEventType.ROUTE_CHANGED]: { data: { url: string; type: 'push' | 'replace' } };
  [WebViewEventType.NOTIFICATION_READ]: { data: { unreadCount: number } };
  [WebViewEventType.HAPTIC_FEEDBACK]: { data: { style: HapticStyle } };
  [WebViewEventType.SHARE_REQUEST]: { data: { title: string; url: string; message?: string } };
  [WebViewEventType.ALARM_DOT_CHANGED]: { data: { hasNewAlarm: boolean } };
  [WebViewEventType.CHANNEL_TALK_VISIBILITY]: { data: { isOpen: boolean } };
  [WebViewEventType.WRITE_DRAFT_CHANGED]: { data: { dirty: boolean } };
};
export interface WebViewEvent<T extends WebViewEventType> {
  type: T;
  payload: WebViewEventPayloads[T];
}
export enum WebViewReceiverEventType {
  TOKEN_REFRESH = 'TOKEN_REFRESH',
}
export type WebViewReceiverEventPayloads = {
  [WebViewReceiverEventType.TOKEN_REFRESH]: { data: string };
};
export interface WebViewReceiverEvent<T extends WebViewReceiverEventType> {
  type: T;
  payload: WebViewReceiverEventPayloads[T];
}
