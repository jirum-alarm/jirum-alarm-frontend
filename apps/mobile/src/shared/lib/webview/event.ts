import {
  type WebViewEventPayloads,
  type HapticStyle,
  WebViewEventType,
} from '@/shared/lib/webview';
import {BackHandler, Share} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import {setUnreadCount} from '@/shared/hooks/useUnreadNotifications';
import {setHasNewAlarm} from '@/shared/hooks/useHasNewAlarm';

type EventHandler<T extends WebViewEventType> = (
  payload: WebViewEventPayloads[T],
) => void;

const hapticStyleMap: Record<HapticStyle, () => Promise<void>> = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};

export class EventBridge {
  static pressBackButton: EventHandler<WebViewEventType.PRESS_BACKBUTTON> =
    async () => {
      BackHandler.exitApp();
    };
  static routeChanged: EventHandler<WebViewEventType.ROUTE_CHANGED> =
    async _payload => {};
  static notificationRead: EventHandler<WebViewEventType.NOTIFICATION_READ> =
    async payload => {
      const count = payload.data.unreadCount;
      await Notifications.setBadgeCountAsync(count);
      setUnreadCount(count);
    };
  static hapticFeedback: EventHandler<WebViewEventType.HAPTIC_FEEDBACK> =
    async payload => {
      const style = payload.data.style ?? 'light';
      const trigger = hapticStyleMap[style] ?? hapticStyleMap.light;
      await trigger();
    };
  static shareRequest: EventHandler<WebViewEventType.SHARE_REQUEST> =
    async payload => {
      const {title, url, message} = payload.data;
      await Share.share({
        title,
        url,
        message: message ?? `${title} ${url}`,
      });
    };
  static alarmDotChanged: EventHandler<WebViewEventType.ALARM_DOT_CHANGED> =
    async payload => {
      setHasNewAlarm(payload.data.hasNewAlarm);
    };
}
