import type * as Notifications from 'expo-notifications';

jest.mock('expo-notifications', () => ({}));
jest.mock('@react-native-firebase/messaging', () => ({}));

const {
  foregroundNotificationBehavior,
} = require('../src/shared/lib/fcm/fcm-handler');

const withTrigger = (trigger: unknown): Notifications.Notification =>
  ({request: {trigger}} as unknown as Notifications.Notification);

/**
 * 앱이 떠 있을 때 — 한 푸시는 정확히 한 번 떠야 한다.
 * 원격 원본(iOS 가 핸들러로 넘긴다)은 숨기고, onForegroundMessageHandler 가
 * 예약한 로컬 사본(trigger: null)만 보여준다.
 */
describe('foregroundNotificationBehavior', () => {
  it('로컬 사본은 배너·목록·소리로 보여준다', () => {
    const b: Notifications.NotificationBehavior =
      foregroundNotificationBehavior(withTrigger(null));
    expect(b.shouldShowBanner).toBe(true);
    expect(b.shouldShowList).toBe(true);
    expect(b.shouldPlaySound).toBe(true);
  });

  it('원격 원본은 숨긴다 — 보여주면 iOS 에서 두 번 뜬다', () => {
    const b: Notifications.NotificationBehavior =
      foregroundNotificationBehavior(withTrigger({type: 'push'}));
    expect(b.shouldShowBanner).toBe(false);
    expect(b.shouldShowList).toBe(false);
    expect(b.shouldPlaySound).toBe(false);
  });

  it('배지는 건드리지 않는다(setBadgeCountAsync 가 맞춘다)', () => {
    expect(
      foregroundNotificationBehavior(withTrigger(null)).shouldSetBadge,
    ).toBe(false);
  });
});
