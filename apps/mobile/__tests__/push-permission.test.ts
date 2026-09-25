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

const mockAddToken = jest.fn(() => Promise.resolve({}));
jest.mock('../src/shared/api/notification', () => ({
  NotificationService: {addToken: () => mockAddToken()},
}));
jest.mock('../src/shared/lib/persistence', () => ({
  setAsyncStorage: jest.fn(() => Promise.resolve()),
}));
jest.mock('../src/shared/lib/device/device-id', () => ({
  waitForDeviceId: jest.fn(() => Promise.resolve()),
}));

const {
  requestPushPermissionIfNeeded,
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
