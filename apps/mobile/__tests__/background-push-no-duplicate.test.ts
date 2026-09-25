import type {FirebaseMessagingTypes} from '@react-native-firebase/messaging';

/**
 * 백그라운드 푸시는 한 번만 떠야 한다. notification 이 실린 메시지는 OS 가 이미
 * 트레이에 올렸으므로 로컬로 또 띄우면 두 번 뜬다(서버는 항상 notification+data).
 */
const mockSchedule = jest.fn((_: unknown) => Promise.resolve('id'));
jest.mock('expo-notifications', () => ({
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  scheduleNotificationAsync: (req: unknown) => mockSchedule(req),
  AndroidImportance: {HIGH: 4},
}));
jest.mock('@react-native-firebase/messaging', () => ({}));

const {
  onBackgroundMessageHandler,
} = require('../src/shared/lib/fcm/fcm-handler');

beforeEach(() => jest.clearAllMocks());

it('notification 이 있으면 띄우지 않는다(OS 가 이미 띄웠다)', async () => {
  const message: FirebaseMessagingTypes.RemoteMessage = {
    notification: {title: '키워드 알림', body: '핫딜'},
    data: {link: 'https://jirum-alarm.com/products/1'},
    fcmOptions: {},
  };
  await onBackgroundMessageHandler(message);
  expect(mockSchedule).not.toHaveBeenCalled();
});
