import type {WebViewMessageEvent} from 'react-native-webview';
import {AuthBridge} from './auth';
import {EventBridge} from './event';
export enum WebViewEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_REMOVE = 'TOKEN_REMOVE',
  PRESS_BACKBUTTON = 'PRESS_BACKBUTTON',
  'ROUTE_CHANGED' = 'ROUTE_CHANGED',
}

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
