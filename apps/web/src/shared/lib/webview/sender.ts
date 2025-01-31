import type {
  WebViewEvent,
  WebViewEventPayloads,
  WebViewEventType,
} from '@/shared/lib/webview/type';

export class WebviewBridge {
  static sendMessage<T extends WebViewEventType>(type: T, payload: WebViewEventPayloads[T]) {
    const message = this.createWebViewEvent(type, payload);
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }
  private static createWebViewEvent<T extends WebViewEventType>(
    type: T,
    payload: WebViewEventPayloads[T],
  ): WebViewEvent<T> {
    return { type, payload };
  }
  private static parseWebViewEvent(message: string): WebViewEvent<WebViewEventType> | null {
    try {
      const event = JSON.parse(message);
      if (event.type && event.payload) {
        return event;
      }
      return null;
    } catch {
      return null;
    }
  }
}
