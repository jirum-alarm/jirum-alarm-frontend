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
const {syncDeviceIdFromWeb} = require('../src/shared/lib/device/device-id');

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
