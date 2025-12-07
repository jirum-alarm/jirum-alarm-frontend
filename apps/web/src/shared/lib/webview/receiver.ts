import {
  type WebViewReceiverEvent,
  type WebViewReceiverEventPayloads,
  WebViewReceiverEventType,
} from '@shared/lib/webview/type';
type EventHandler<T extends WebViewReceiverEventType> = (
  payload: WebViewReceiverEventPayloads[T],
) => void;

export class AuthHandler {
  static tokenRefresh: EventHandler<WebViewReceiverEventType.TOKEN_REFRESH> = (payload) => {
    console.log('Token refreshed:', payload);
  };
}

const eventHandlers: {
  [key in WebViewReceiverEventType]: (payload: any) => void;
} = {
  [WebViewReceiverEventType.TOKEN_REFRESH]: AuthHandler.tokenRefresh,
};

export const handleReactNativeEvent = (message: string) => {
  const parsedMessage: WebViewReceiverEvent<WebViewReceiverEventType> = JSON.parse(message);

  const handler = eventHandlers[parsedMessage.type];
  if (handler) {
    handler(parsedMessage.payload);
  } else {
    console.warn('Unknown event type:', parsedMessage.type);
  }
};
