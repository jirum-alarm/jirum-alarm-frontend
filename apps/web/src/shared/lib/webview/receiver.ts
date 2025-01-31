import {
  type WebViewEvent,
  type WebViewEventPayloads,
  WebViewEventType,
} from '@/shared/lib/webview/type';
type EventHandler<T extends WebViewEventType> = (payload: WebViewEventPayloads[T]) => void;

export class AuthHandler {
  static tokenRefresh: EventHandler<WebViewEventType.TOKEN_REFRESH> = (payload) => {
    console.log('Token refreshed:', payload);
  };
}

const eventHandlers: {
  [key in WebViewEventType]: (payload: any) => void;
} = {
  [WebViewEventType.TOKEN_REFRESH]: AuthHandler.tokenRefresh,
};

export const handleReactNativeEvent = (message: string) => {
  const parsedMessage: WebViewEvent<WebViewEventType> = JSON.parse(message);

  const handler = eventHandlers[parsedMessage.type];
  if (handler) {
    handler(parsedMessage.payload);
  } else {
    console.warn('Unknown event type:', parsedMessage.type);
  }
};
