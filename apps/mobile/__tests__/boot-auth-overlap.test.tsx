/**
 * 콜드 스타트 — 토큰 갱신이 디스크 캐시 복원을 **기다리지 않고** 같이 출발하는지.
 *
 * 예전엔 복원(최대 800ms)이 끝나 화면이 마운트된 뒤에야 useAuth 가 갱신을 걸었고,
 * 홈 쿼리(access token)는 그 왕복을 또 기다렸다. 알림 → 상세도 그만큼 늦게 그려졌다.
 */
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {addEventListener: jest.fn(() => () => {})},
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
  removeItem: jest.fn(async () => {}),
}));

// 복원은 끝나지 않은 채로 둔다 — 그 사이에 갱신이 나가야 한다.
jest.mock('../src/shared/lib/persistence/query-cache', () => ({
  restoreQueryCache: jest.fn(() => new Promise<void>(() => {})),
  saveQueryCache: jest.fn(async () => {}),
}));

const mockGetAsyncStorage = jest.fn(
  async (_key: string): Promise<string | null> => null,
);
jest.mock('../src/shared/lib/persistence', () => ({
  getAsyncStorage: (key: string) => mockGetAsyncStorage(key),
}));

import ReactQueryProvider, {
  queryClient,
} from '../src/provider/ReactQueryProvider';
import {AuthQueries} from '../src/entities/auth';
import {StorageKey} from '../src/shared/constant/storage-key';

const flush = async () => {
  for (let i = 0; i < 5; i += 1) await Promise.resolve();
};

describe('ReactQueryProvider — 갱신과 복원을 겹친다', () => {
  let prefetch: jest.SpyInstance;
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  beforeEach(() => {
    jest.useFakeTimers();
    prefetch = jest
      .spyOn(queryClient, 'prefetchQuery')
      .mockImplementation(async () => {});
  });

  afterEach(async () => {
    await ReactTestRenderer.act(async () => renderer?.unmount());
    prefetch.mockRestore();
    jest.useRealTimers();
  });

  const mount = async () => {
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ReactQueryProvider>{null}</ReactQueryProvider>,
      );
      await flush();
    });
  };

  it('refresh token 이 있으면 복원이 안 끝났어도 갱신을 시작한다', async () => {
    mockGetAsyncStorage.mockImplementation(async key =>
      key === StorageKey.REFRESH_TOKEN ? 'r' : null,
    );
    await mount();
    expect(prefetch).toHaveBeenCalledTimes(1);
    expect(prefetch.mock.calls[0][0].queryKey).toEqual(
      AuthQueries.keys.loginByRefreshToken(),
    );
  });

  it('refresh token 이 없으면 걸지 않는다 — 곧 거절될 요청을 두 번 보내지 않게', async () => {
    mockGetAsyncStorage.mockImplementation(async () => null);
    await mount();
    expect(prefetch).not.toHaveBeenCalled();
  });
});
