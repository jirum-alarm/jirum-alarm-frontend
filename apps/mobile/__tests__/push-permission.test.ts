export {};

/**
 * 키워드 등록 뒤 알림 권한 요청 — "필요할 때만" 묻는 판정을 실행해서 고정한다.
 * (web useFcmPermission().requestPermission() 과 같은 자리)
 */

type Perm = {granted: boolean; canAskAgain: boolean};

const mockGetPermissions = jest.fn<Promise<Perm>, []>();
const mockRequestPermissions = jest.fn<Promise<Perm>, []>();
jest.mock('expo-notifications', () => ({
  __esModule: true,
  getPermissionsAsync: () => mockGetPermissions(),
  requestPermissionsAsync: () => mockRequestPermissions(),
}));

const mockGetToken = jest.fn(() => Promise.resolve('fcm-token'));
jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: () => ({
    getToken: mockGetToken,
    registerDeviceForRemoteMessages: jest.fn(() => Promise.resolve()),
  }),
}));

const mockAddToken = jest.fn((_: {token: string; tokenType: string}) =>
  Promise.resolve({}),
);
jest.mock('../src/shared/api/notification', () => ({
  NotificationService: {
    addToken: (v: {token: string; tokenType: string}) => mockAddToken(v),
  },
}));
const mockGetAsyncStorage = jest.fn<Promise<string | null>, [string]>();
jest.mock('../src/shared/lib/persistence', () => ({
  setAsyncStorage: jest.fn(() => Promise.resolve()),
  getAsyncStorage: (key: string) => mockGetAsyncStorage(key),
}));
jest.mock('../src/shared/lib/device/device-id', () => ({
  waitForDeviceId: jest.fn(() => Promise.resolve()),
}));

const {
  requestPushPermissionIfNeeded,
  bindFcmTokenToUser,
} = require('../src/shared/lib/fcm/push-permission');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('requestPushPermissionIfNeeded', () => {
  it('이미 허용이면 아무것도 안 한다', async () => {
    mockGetPermissions.mockResolvedValue({granted: true, canAskAgain: true});
    await requestPushPermissionIfNeeded();
    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockAddToken).not.toHaveBeenCalled();
  });

  it('다시 물을 수 없으면(iOS 거부 확정·Android 영구 거부) 묻지 않는다', async () => {
    mockGetPermissions.mockResolvedValue({granted: false, canAskAgain: false});
    await requestPushPermissionIfNeeded();
    expect(mockRequestPermissions).not.toHaveBeenCalled();
  });

  it('물을 수 있으면 묻고, 허용되면 토큰을 등록한다', async () => {
    mockGetPermissions.mockResolvedValue({granted: false, canAskAgain: true});
    mockRequestPermissions.mockResolvedValue({
      granted: true,
      canAskAgain: true,
    });
    await requestPushPermissionIfNeeded();
    expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
    expect(mockGetToken).toHaveBeenCalledTimes(1);
    expect(mockAddToken).toHaveBeenCalledTimes(1);
  });

  it('거부하면 토큰을 등록하지 않는다', async () => {
    mockGetPermissions.mockResolvedValue({granted: false, canAskAgain: true});
    mockRequestPermissions.mockResolvedValue({
      granted: false,
      canAskAgain: false,
    });
    await requestPushPermissionIfNeeded();
    expect(mockAddToken).not.toHaveBeenCalled();
  });

  it('실패는 삼킨다 — 키워드 등록 흐름을 막지 않는다', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockGetPermissions.mockRejectedValue(new Error('native'));
    await expect(requestPushPermissionIfNeeded()).resolves.toBeUndefined();
    log.mockRestore();
  });
});

/**
 * 네이티브 로그인 직후 — 진입 때 익명으로 올린 토큰을 로그인 계정에 다시 묶는다.
 * 이게 없으면 새로 깔고 로그인한 유저는 앱을 재시작하기 전까지 키워드 알림을 못 받는다.
 */
describe('bindFcmTokenToUser', () => {
  it('저장된 토큰을 그대로 다시 등록한다(로그인 토큰이 붙은 요청으로)', async () => {
    mockGetAsyncStorage.mockResolvedValue('stored-token');
    await bindFcmTokenToUser();
    expect(mockGetAsyncStorage).toHaveBeenCalledWith('fcmDeviceToken');
    expect(mockAddToken).toHaveBeenCalledWith({
      token: 'stored-token',
      tokenType: 'FCM',
    });
  });

  it('저장된 토큰이 없으면 등록하지 않는다(권한은 다른 경로가 맡는다)', async () => {
    mockGetAsyncStorage.mockResolvedValue(null);
    await bindFcmTokenToUser();
    expect(mockAddToken).not.toHaveBeenCalled();
  });

  it('실패는 삼킨다 — 로그인은 이미 성공했다', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockGetAsyncStorage.mockResolvedValue('stored-token');
    mockAddToken.mockRejectedValueOnce(new Error('network'));
    await expect(bindFcmTokenToUser()).resolves.toBeUndefined();
    log.mockRestore();
  });
});
