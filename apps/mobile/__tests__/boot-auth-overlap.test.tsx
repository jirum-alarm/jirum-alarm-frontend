/**
 * 콜드 스타트 — 디스크 캐시 복원이 화면을 막지 않고, 토큰 갱신은 마운트 즉시 출발하는지.
 *
 * 예전엔 AsyncStorage 복원(최대 800ms)이 끝나야 화면이 마운트됐고, 그 뒤에야 useAuth 가 갱신을 걸어
 * 홈 쿼리(access token)는 그 왕복을 또 기다렸다. 1.5.5 부터 복원은 MMKV 동기 — 첫 렌더 전에 끝난다.
 */
import * as React from 'react';
import {Text} from 'react-native';
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

// 복원은 import 시점에 불린다 — 목 함수는 팩토리 안에서 만든다(바깥 const 는 아직 초기화 전).
jest.mock('../src/shared/lib/persistence/query-cache', () => ({
  restoreQueryCache: jest.fn((): boolean => false),
  saveQueryCache: jest.fn(),
  dropLegacyAsyncCache: jest.fn(async () => {}),
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
import {restoreQueryCache} from '../src/shared/lib/persistence/query-cache';

const mockRestore = restoreQueryCache as jest.Mock;

const flush = async () => {
  for (let i = 0; i < 5; i += 1) await Promise.resolve();
};

describe('ReactQueryProvider — 복원은 동기, 갱신은 즉시', () => {
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

  it('복원은 모듈 로드 때 동기로 한 번 끝나고, children 은 기다림 없이 첫 렌더에 그려진다', async () => {
    // 복원은 import 시점(첫 렌더 전)에 이미 불렸다.
    expect(mockRestore).toHaveBeenCalledTimes(1);
    expect(mockRestore.mock.calls[0][0]).toBe(queryClient);
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <ReactQueryProvider>
          <Text>home</Text>
        </ReactQueryProvider>,
      );
    });
    // 타이머를 하나도 돌리지 않았는데 보인다(예전엔 800ms 대기 게이트).
    expect(renderer?.root.findByType(Text).props.children).toBe('home');
    expect(mockRestore).toHaveBeenCalledTimes(1);
  });

  it('refresh token 이 있으면 마운트 즉시 갱신을 시작한다', async () => {
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
