export {};

/**
 * 기기 id 가 GA4 user property `device_id` 로 실린다 — 서버 로그(X-Device-Id)·실험 버킷과
 * BigQuery 를 잇는 열쇠(2026-10-22: GA4 쪽 기기 id 0%). 웹 게스트를 이어받아 id 가 바뀌면 따라간다.
 */
const store: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (k: string) => store[k] ?? null),
  setItem: jest.fn(async (k: string, v: string) => {
    store[k] = v;
  }),
  removeItem: jest.fn(async (k: string) => {
    delete store[k];
  }),
}));
const mockSetUserProperty = jest.fn((_name: string, _value: string | null) =>
  Promise.resolve(),
);
jest.mock('@react-native-firebase/analytics', () => ({
  __esModule: true,
  default: () => ({setUserProperty: mockSetUserProperty}),
}));

const {
  getDeviceId,
  syncDeviceIdFromWeb,
} = require('../src/shared/lib/device/device-id');

describe('기기 id → GA4 device_id', () => {
  it('처음 정해질 때 싣고, 웹 게스트 id 로 바뀌면 다시 싣는다', async () => {
    const created: string = await getDeviceId();
    expect(mockSetUserProperty).toHaveBeenLastCalledWith('device_id', created);

    await syncDeviceIdFromWeb('web-device-1');
    expect(mockSetUserProperty).toHaveBeenLastCalledWith(
      'device_id',
      'web-device-1',
    );

    // 같은 id 로 다시 와도 또 부르지 않는다.
    const calls = mockSetUserProperty.mock.calls.length;
    await syncDeviceIdFromWeb('web-device-1');
    expect(await getDeviceId()).toBe('web-device-1');
    expect(mockSetUserProperty).toHaveBeenCalledTimes(calls);
  });
});
