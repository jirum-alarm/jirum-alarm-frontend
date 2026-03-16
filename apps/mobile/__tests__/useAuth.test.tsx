import CookieManager from '@react-native-cookies/cookies';
import {useQuery} from '@tanstack/react-query';
import * as ReactTestRenderer from 'react-test-renderer';
import {SERVICE_URL} from '../src/constants/env';
import {StorageKey} from '../src/shared/constant/storage-key';
import {useAuth} from '../src/shared/hooks/useAuth';
import {
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
  setAsyncStorage: jest.fn(),
  removeAsyncStorage: jest.fn(),
}));

const mockUseQuery = useQuery as jest.Mock;
const mockCookieSet = CookieManager.set as jest.Mock;
const mockSetAsyncStorage = setAsyncStorage as jest.Mock;
const mockRemoveAsyncStorage = removeAsyncStorage as jest.Mock;

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
    jest.clearAllMocks();
    latestAuthState = undefined;
    mockSetAsyncStorage.mockResolvedValue(undefined);
    mockRemoveAsyncStorage.mockResolvedValue(undefined);
    mockCookieSet.mockResolvedValue(true);
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
    expect(latestAuthState).toEqual({
      isLoading: false,
      isLogin: true,
    });

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
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
    expect(latestAuthState).toEqual({
      isLoading: false,
      isLogin: true,
    });

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  it('clears persisted auth state when refresh-token login fails', async () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
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
    expect(latestAuthState).toEqual({
      isLoading: false,
      isLogin: false,
    });

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });
});
