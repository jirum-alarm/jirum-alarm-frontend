import {
  type WebViewEventPayloads,
  WebViewEventType,
} from '@/shared/lib/webview';
import {BackHandler} from 'react-native';
import notifee from '@notifee/react-native';

type EventHandler<T extends WebViewEventType> = (
  payload: WebViewEventPayloads[T],
) => void;

export class EventBridge {
  static pressBackButton: EventHandler<WebViewEventType.PRESS_BACKBUTTON> =
    async () => {
      BackHandler.exitApp(); // 앱 종료 or 뒤로 가기 원하는 대로 수정 가능
      console.log('pressBackButton!!!!!!');
    };
  static routeChanged: EventHandler<WebViewEventType.ROUTE_CHANGED> =
    async payload => {
      // BackHandler.exitApp(); // 앱 종료 or 뒤로 가기 원하는 대로 수정 가능
      console.log('route changed!!!!!!', payload);
    };
  static notificationRead: EventHandler<WebViewEventType.NOTIFICATION_READ> =
    async payload => {
      await notifee.setBadgeCount(payload.data.unreadCount);
    };
}
