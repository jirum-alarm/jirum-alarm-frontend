export {};

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
const {HttpClient} = require('../src/shared/lib/client/http-client');
const {
  syncDeviceIdFromWeb,
  waitForDeviceId,
} = require('../src/shared/lib/device/device-id');

describe('X-Device-Id 헤더', () => {
  let sent: any;
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    sent = undefined;
    (globalThis as any).fetch = jest.fn(async (_u: string, o: any) => {
      sent = o;
      return {json: async () => ({data: {}})};
    });
  });
  it('deviceId 가 없으면 헤더를 안 보낸다', async () => {
    await HttpClient.withNoAuth().execute(
      'query{__typename}' as any,
      {} as any,
    );
    expect(sent.headers['X-Device-Id']).toBeUndefined();
  });
  it('웹뷰에서 받은 deviceId 를 헤더로 보낸다', async () => {
    await syncDeviceIdFromWeb('web-generated-id-123');
    await HttpClient.withNoAuth().execute(
      'query{__typename}' as any,
      {} as any,
    );
    expect(sent.headers['X-Device-Id']).toBe('web-generated-id-123');
  });
});

// 푸시 토큰 등록이 웹뷰 DEVICE_ID_SYNC 보다 먼저 뜨는 첫 실행 레이스 가드.
// X-Device-Id 없이 등록되면 서버가 deviceId=NULL 로 저장하고 그 토큰은 기기 단위
// 옛 토큰 회수에서 영구 제외돼 알림이 중복 발송된다.
describe('waitForDeviceId()', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    jest.resetModules();
  });

  it('나중에 도착한 deviceId 로 깨어난다', async () => {
    const {
      syncDeviceIdFromWeb: sync,
      waitForDeviceId: wait,
    } = require('../src/shared/lib/device/device-id');

    const pending = wait(5000);
    // 웹뷰 sync 가 등록보다 늦게 도착하는 실제 순서.
    await sync('late-arriving-id');

    expect(await pending).toBe('late-arriving-id');
  });

  it('deviceId 가 안 오면 타임아웃 후 null — 등록을 막지 않는다', async () => {
    const {
      waitForDeviceId: wait,
    } = require('../src/shared/lib/device/device-id');

    jest.useFakeTimers();
    const pending = wait(10_000);
    await Promise.resolve(); // waiter 등록 완료 대기
    jest.advanceTimersByTime(10_000);
    const result = await pending;
    jest.useRealTimers();

    expect(result).toBeNull();
  });

  it('이미 있으면 기다리지 않는다', async () => {
    await syncDeviceIdFromWeb('already-here');
    expect(await waitForDeviceId(0)).toBe('already-here');
  });
});
