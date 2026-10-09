import CookieManager from '@react-native-cookies/cookies';
import {useQuery} from '@tanstack/react-query';
import * as ReactTestRenderer from 'react-test-renderer';
import {SERVICE_URL} from '../src/constants/env';
import {StorageKey} from '../src/shared/constant/storage-key';
import {__resetAuthSyncForTest, useAuth} from '../src/shared/hooks/useAuth';
import {FetchError} from '../src/shared/lib/client/http-client';
import {
  getAsyncStorage,
  removeAsyncStorage,
  setAsyncStorage,
} from '../src/shared/lib/persistence';

jest.mock('@tanstack/react-query', () => ({
  queryOptions: jest.fn(options => options),
  useQuery: jest.fn(),
}));

jest.mock('@react-native-cookies/cookies', () => ({
  __esModule: true,
  default: {
    set: jest.fn(),
  },
}));

jest.mock('../src/shared/lib/persistence', () => ({
  getAsyncStorage: jest.fn(),
  setAsyncStorage: jest.fn(),
  removeAsyncStorage: jest.fn(),
}));

const mockUseQuery = useQuery as jest.Mock;
const mockCookieSet = CookieManager.set as jest.Mock;
const mockSetAsyncStorage = setAsyncStorage as jest.Mock;
const mockRemoveAsyncStorage = removeAsyncStorage as jest.Mock;
const mockGetAsyncStorage = getAsyncStorage as jest.Mock;

const flushMicrotasks = async (cycles = 5) => {
  for (let index = 0; index < cycles; index += 1) {
    await Promise.resolve();
  }
};

let latestAuthState: ReturnType<typeof useAuth> | undefined;

const AuthConsumer = () => {
  latestAuthState = useAuth();
  return null;
};

const renderUseAuth = async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<AuthConsumer />);
    await flushMicrotasks();
  });

  await ReactTestRenderer.act(async () => {
    await flushMicrotasks();
  });

  if (renderer === undefined) {
    throw new Error('useAuth renderer was not created');
  }

  return renderer;
};

describe('useAuth', () => {
  beforeEach(() => {
    // 동기화 상태는 앱 전체 단일값(모듈)이라 테스트마다 처음으로 되돌린다.
    __resetAuthSyncForTest();
    jest.clearAllMocks();
    latestAuthState = undefined;
    mockSetAsyncStorage.mockResolvedValue(undefined);
    mockRemoveAsyncStorage.mockResolvedValue(undefined);
    mockCookieSet.mockResolvedValue(true);
    mockGetAsyncStorage.mockResolvedValue(null);
  });

  it('stores both tokens and mirrors them into cookies after a successful refresh', async () => {
    mockUseQuery.mockReturnValue({
      data: {
        loginByRefreshToken: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      },
      isError: false,
      isLoading: false,
      isSuccess: true,
    });

    const renderer = await renderUseAuth();

    expect(mockSetAsyncStorage).toHaveBeenNthCalledWith(
      1,
      StorageKey.ACCESS_TOKEN,
      'access-token',
    );
    expect(mockSetAsyncStorage).toHaveBeenNthCalledWith(
      2,
      StorageKey.REFRESH_TOKEN,
      'refresh-token',
    );
    expect(mockCookieSet).toHaveBeenNthCalledWith(1, SERVICE_URL, {
      name: 'ACCESS_TOKEN',
      value: 'access-token',
    });
    expect(mockCookieSet).toHaveBeenNthCalledWith(2, SERVICE_URL, {
      name: 'REFRESH_TOKEN',
      value: 'refresh-token',
    });
    expect(latestAuthState).toMatchObject({
      isLoading: false,
      isLogin: true,
    });

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  // 1.4.6 심사 거절(2026-09-26, iPadOS 27): "로그인 성공" 토스트만 뜨고 로그인 화면에 갇혔다.
  // 쿠키 동기화가 throw 하면 isCookieReady 가 영원히 false 였다 — 쿠키 실패가 로그인을 막으면 안 된다.
  it('still logs in when mirroring tokens into cookies fails', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockCookieSet.mockRejectedValue(new Error('cookie store unavailable'));
    mockUseQuery.mockReturnValue({
      data: {
        loginByRefreshToken: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      },
      isError: false,
      isLoading: false,
      isSuccess: true,
    });

    const renderer = await renderUseAuth();

    expect(latestAuthState).toMatchObject({
      isLoading: false,
      isLogin: true,
    });
    expect(warn).toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
    warn.mockRestore();
  });

  it('skips the refresh-token cookie when the refresh token is missing', async () => {
    mockUseQuery.mockReturnValue({
      data: {
        loginByRefreshToken: {
          accessToken: 'access-token',
          refreshToken: null,
        },
      },
      isError: false,
      isLoading: false,
      isSuccess: true,
    });

    const renderer = await renderUseAuth();

    expect(mockCookieSet).toHaveBeenCalledTimes(1);
    expect(mockCookieSet).toHaveBeenCalledWith(SERVICE_URL, {
      name: 'ACCESS_TOKEN',
      value: 'access-token',
    });
    expect(mockCookieSet).not.toHaveBeenCalledWith(SERVICE_URL, {
      name: 'REFRESH_TOKEN',
      value: expect.anything(),
    });
    expect(latestAuthState).toMatchObject({
      isLoading: false,
      isLogin: true,
    });

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  it('clears persisted auth state when the server rejects the refresh token', async () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: new FetchError({
        message: 'Forbidden resource',
        extensions: {
          code: 'FORBIDDEN',
          originalError: {
            error: 'Forbidden',
            message: 'Forbidden resource',
            statusCode: 403,
          },
        },
      }),
      isError: true,
      isLoading: false,
      isSuccess: false,
    });

    const renderer = await renderUseAuth();

    expect(mockRemoveAsyncStorage).toHaveBeenNthCalledWith(
      1,
      StorageKey.ACCESS_TOKEN,
    );
    expect(mockRemoveAsyncStorage).toHaveBeenNthCalledWith(
      2,
      StorageKey.REFRESH_TOKEN,
    );
    expect(mockCookieSet).not.toHaveBeenCalled();
    expect(latestAuthState).toMatchObject({
      isLoading: false,
      isLogin: false,
    });

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  // 주기 갱신이 네트워크 오류로 실패해도 로그아웃되면 안 된다 — 직전 data 로 버틴다.
  it('keeps the session when a later background refresh fails on the network', async () => {
    const data = {
      loginByRefreshToken: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
    };
    mockUseQuery.mockReturnValue({
      data,
      isError: false,
      isLoading: false,
      isSuccess: true,
    });
    const renderer = await renderUseAuth();
    expect(latestAuthState?.isLogin).toBe(true);

    // react-query 는 refetch 가 실패해도 직전 data 를 남기고 status 만 error 로 바꾼다.
    mockUseQuery.mockReturnValue({
      data,
      error: new TypeError('Network request failed'),
      isError: true,
      isLoading: false,
      isSuccess: false,
    });
    await ReactTestRenderer.act(async () => {
      renderer.update(<AuthConsumer />);
      await flushMicrotasks();
    });

    expect(mockRemoveAsyncStorage).not.toHaveBeenCalled();
    expect(latestAuthState?.isLogin).toBe(true);

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  /**
   * ★동기화는 앱 전체에서 토큰당 한 번. 나중에 마운트된 화면(상세의 찜·추천 등)은
   * 첫 렌더부터 로그인 상태여야 한다 — 예전엔 인스턴스마다 false 로 시작해 그 사이 탭이
   * "로그인 후 이용해주세요" 로 튕겼다.
   */
  it('a later-mounted consumer is logged in from its first render and does not re-sync', async () => {
    mockUseQuery.mockReturnValue({
      data: {loginByRefreshToken: {accessToken: 'a1', refreshToken: 'r1'}},
      isError: false,
      isLoading: false,
      isSuccess: true,
    });
    await renderUseAuth();
    expect(mockCookieSet).toHaveBeenCalledTimes(2);

    const firstRender: boolean[] = [];
    const Late = () => {
      const {isLogin} = useAuth();
      if (firstRender.length === 0) firstRender.push(isLogin);
      return null;
    };
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<Late />);
      await flushMicrotasks();
    });
    expect(firstRender[0]).toBe(true);
    expect(mockCookieSet).toHaveBeenCalledTimes(2); // 같은 토큰은 다시 쓰지 않는다
  });

  it('a refreshed access token keeps isLogin true while it syncs', async () => {
    mockUseQuery.mockReturnValue({
      data: {loginByRefreshToken: {accessToken: 'a1', refreshToken: 'r1'}},
      isError: false,
      isLoading: false,
      isSuccess: true,
    });
    const renderer = await renderUseAuth();
    expect(latestAuthState?.isLogin).toBe(true);

    let resolveCookie: () => void = () => {};
    mockCookieSet.mockImplementation(
      () => new Promise<boolean>(r => (resolveCookie = () => r(true))),
    );
    mockUseQuery.mockReturnValue({
      data: {loginByRefreshToken: {accessToken: 'a2', refreshToken: 'r2'}},
      isError: false,
      isLoading: false,
      isSuccess: true,
    });
    await ReactTestRenderer.act(async () => {
      renderer.update(<AuthConsumer />);
      await flushMicrotasks();
    });
    // 새 토큰 동기화가 아직 안 끝났어도 로그인 화면으로 튕기지 않는다.
    expect(latestAuthState?.isLogin).toBe(true);
    await ReactTestRenderer.act(async () => {
      resolveCookie();
      await flushMicrotasks();
    });
  });

  // 콜드 스타트: 저장된 refresh token 이 있으면 갱신 응답을 기다리지 않고 바로 메인을 그린다.
  it('shows the main app right away when a refresh token is stored', async () => {
    mockGetAsyncStorage.mockResolvedValue('stored-refresh');
    mockUseQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
      isSuccess: false,
    });

    const renderer = await renderUseAuth();

    expect(latestAuthState).toMatchObject({isLoading: false, isLogin: true});

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  // 오프라인으로 켜도(네트워크 실패) 토큰이 있으면 로그인 화면에 가두지 않는다.
  it('stays in the main app when the first refresh fails on the network', async () => {
    mockGetAsyncStorage.mockResolvedValue('stored-refresh');
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: new TypeError('Network request failed'),
      isError: true,
      isLoading: false,
      isSuccess: false,
    });

    const renderer = await renderUseAuth();

    expect(latestAuthState).toMatchObject({isLoading: false, isLogin: true});
    expect(mockRemoveAsyncStorage).not.toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  // 토큰이 없으면 갱신 결과(곧 거절)를 기다린다 — 메인이 한 번 비치지 않게.
  it('keeps the splash while refreshing without a stored token', async () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isError: false,
      isLoading: true,
      isSuccess: false,
    });

    const renderer = await renderUseAuth();

    expect(latestAuthState).toMatchObject({isLoading: true, isLogin: false});

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });
});
