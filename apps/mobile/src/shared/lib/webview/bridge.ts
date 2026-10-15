import type {WebViewMessageEvent} from 'react-native-webview';
import {AuthBridge} from './auth';
import {EventBridge} from './event';
export enum WebViewEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_REMOVE = 'TOKEN_REMOVE',
  PRESS_BACKBUTTON = 'PRESS_BACKBUTTON',
  'ROUTE_CHANGED' = 'ROUTE_CHANGED',
  NOTIFICATION_READ = 'NOTIFICATION_READ',
  HAPTIC_FEEDBACK = 'HAPTIC_FEEDBACK',
  SHARE_REQUEST = 'SHARE_REQUEST',
  CHANNEL_TALK_VISIBILITY = 'CHANNEL_TALK_VISIBILITY',
  // ★삭제된 이벤트: ALARM_DOT_CHANGED. 탭바 알림 점은 이제 네이티브가 직접
  // 판정한다(useHasNewAlarm). 유일한 송신자였던 web BottomNav 는 앱에서
  // isJirumAlarmApp 조기 반환에 걸려 렌더 자체가 안 돼 이 메시지가 앱에 온 적이
  // 없다 — 되살리면 네이티브 판정을 남의 boolean 으로 덮어쓰게 된다.
  /**
   * 웹뷰 localStorage 의 deviceId 를 네이티브로 넘긴다.
   * 네이티브 상세가 조회 수집을 직접 하므로 같은 식별자를 써야 집계가 안 쪼개진다.
   * (web 이 보내는 게 아니라 네이티브가 주입한 스크립트가 보낸다)
   */
  DEVICE_ID_SYNC = 'DEVICE_ID_SYNC',
  /** 웹뷰에서 상세 링크 클릭을 가로챈 결과. TabWebView 가 네이티브로 push 한다. */
  OPEN_PRODUCT_DETAIL = 'OPEN_PRODUCT_DETAIL',
  /** 웹 글쓰기 폼에 쓰던 내용이 있나. 글쓰기 화면(CommunityWriteScreen)이 나가기 전 확인에 쓴다. */
  WRITE_DRAFT_CHANGED = 'WRITE_DRAFT_CHANGED',
}

export type HapticStyle =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error';

export type WebViewEventPayloads = {
  [WebViewEventType.LOGIN_SUCCESS]: {
    data: {accessToken: string; refreshToken: string};
  };
  [WebViewEventType.TOKEN_REFRESH]: {data: string};
  [WebViewEventType.TOKEN_REMOVE]: null;
  [WebViewEventType.PRESS_BACKBUTTON]: null;
  [WebViewEventType.ROUTE_CHANGED]: {
    data: {url: string; type: 'push' | 'replace'};
  };
  [WebViewEventType.NOTIFICATION_READ]: {data: {unreadCount: number}};
  [WebViewEventType.HAPTIC_FEEDBACK]: {data: {style: HapticStyle}};
  [WebViewEventType.SHARE_REQUEST]: {
    data: {title: string; url: string; message?: string};
  };
  [WebViewEventType.CHANNEL_TALK_VISIBILITY]: {data: {isOpen: boolean}};
  [WebViewEventType.DEVICE_ID_SYNC]: {data: {deviceId: string}};
  [WebViewEventType.OPEN_PRODUCT_DETAIL]: {data: {path: string}};
  [WebViewEventType.WRITE_DRAFT_CHANGED]: {data: {dirty: boolean}};
};

export interface WebViewEvent<T extends WebViewEventType> {
  type: T;
  payload: WebViewEventPayloads[T];
}

const eventHandlers: {
  [key in WebViewEventType]: (payload: any) => void;
} = {
  [WebViewEventType.LOGIN_SUCCESS]: AuthBridge.login,
  [WebViewEventType.TOKEN_REFRESH]: AuthBridge.tokenRefresh,
  [WebViewEventType.TOKEN_REMOVE]: AuthBridge.tokenRemove,
  [WebViewEventType.PRESS_BACKBUTTON]: EventBridge.pressBackButton,
  [WebViewEventType.ROUTE_CHANGED]: EventBridge.routeChanged,
  [WebViewEventType.NOTIFICATION_READ]: EventBridge.notificationRead,
  [WebViewEventType.HAPTIC_FEEDBACK]: EventBridge.hapticFeedback,
  [WebViewEventType.SHARE_REQUEST]: EventBridge.shareRequest,
  [WebViewEventType.CHANNEL_TALK_VISIBILITY]: EventBridge.channelTalkVisibility,
  [WebViewEventType.DEVICE_ID_SYNC]: EventBridge.deviceIdSync,
  [WebViewEventType.OPEN_PRODUCT_DETAIL]: EventBridge.openProductDetail,
  // 받는 쪽은 글쓰기 화면의 StackWebView(onDraftChange) — 다른 웹뷰에 오면 할 일이 없다.
  [WebViewEventType.WRITE_DRAFT_CHANGED]: () => {},
};

export const parsedWebViewMessage = (event: WebViewMessageEvent) => {
  const parsedMessage: WebViewEvent<WebViewEventType> = JSON.parse(
    event.nativeEvent.data,
  );
  return parsedMessage;
};

export const handleWebViewMessage = (event: WebViewMessageEvent) => {
  try {
    const parsedMessage = parsedWebViewMessage(event);
    const handler = eventHandlers[parsedMessage.type];
    if (handler) {
      handler(parsedMessage.payload);
    } else {
      console.warn('Unknown event type:', parsedMessage.type);
    }
  } catch (error) {
    console.warn('Failed to handle WebView message:', error);
  }
};
