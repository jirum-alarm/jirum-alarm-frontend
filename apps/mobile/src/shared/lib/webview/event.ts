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
import {setChannelTalkOpen} from '@/shared/hooks/useTabBarVisibility';
import {syncDeviceIdFromWeb} from '@/shared/lib/device/device-id';

let openDetailListeners: Array<(path: string) => void> = [];

/**
 * 지금 포커스된 화면의 상세 열기 핸들러를 쌓는다.
 *
 * 하나만 갈아끼우면 안 된다: 포커스 순서가 (새 화면 focus) → (이전 cleanup)
 * 이라, cleanup 이 `null` 을 넣으면 방금 등록한 리스너를 지운다.
 * 상세 → 검색 → 홈으로 돌아왔을 때 상품 탭이 네이티브 상세로 안 열리던 원인.
 */
export function subscribeOpenDetail(fn: (path: string) => void) {
  openDetailListeners.push(fn);
  return () => {
    const i = openDetailListeners.lastIndexOf(fn);
    if (i >= 0) openDetailListeners.splice(i, 1);
  };
}

/** @deprecated subscribeOpenDetail 을 쓴다. 테스트·구코드 호환용. */
export function setOpenDetailListener(fn: ((path: string) => void) | null) {
  if (fn) {
    openDetailListeners = [fn];
    return;
  }
  openDetailListeners = [];
}

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
      // iOS에서 title/url을 분리해 넘기면 카카오톡 등에서 별도 아이템으로
      // 인식해 메시지가 2번 전송된다. 양 플랫폼 모두 단일 message로 합쳐 전달.
      await Share.share({
        title,
        message: message ?? `${title}\n${url}`,
      });
    };
  static alarmDotChanged: EventHandler<WebViewEventType.ALARM_DOT_CHANGED> =
    async payload => {
      setHasNewAlarm(payload.data.hasNewAlarm);
    };
  static channelTalkVisibility: EventHandler<WebViewEventType.CHANNEL_TALK_VISIBILITY> =
    async payload => {
      setChannelTalkOpen(payload.data.isOpen);
    };
  /**
   * 상세 열기 요청. 네비게이션은 화면이 쥐고 있으므로 여기서는 등록된
   * 리스너에게 넘기기만 한다(TabWebView 가 등록).
   */
  static openProductDetail: EventHandler<WebViewEventType.OPEN_PRODUCT_DETAIL> =
    async payload => {
      openDetailListeners.at(-1)?.(payload.data.path);
    };
  static deviceIdSync: EventHandler<WebViewEventType.DEVICE_ID_SYNC> =
    async payload => {
      await syncDeviceIdFromWeb(payload.data.deviceId);
    };
}
