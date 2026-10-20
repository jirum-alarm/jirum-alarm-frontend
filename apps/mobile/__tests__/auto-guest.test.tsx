import * as ReactTestRenderer from 'react-test-renderer';
import {StorageKey} from '../src/shared/constant/storage-key';
import {useAutoGuest} from '../src/screens/auth/useAutoGuest';
import {getAsyncStorage, setAsyncStorage} from '../src/shared/lib/persistence';

/**
 * 첫 실행 자동 게스트 진입(2026-10-12). 앱 첫 화면이 로그인 벽이라 처음 연 사람 대부분이 안으로 못 들어왔다.
 * 지키는 것: 첫 실행만 자동 진입, 세션이 있었던 기기(로그아웃·만료·게스트 나가기)는 로그인 화면,
 * 발급 실패·지연이면 스플래시에 갇히지 않고 로그인 화면.
 */

const mockStartAutoGuest = jest.fn();
jest.mock('../src/screens/auth/useGuestLogin', () => ({
  useGuestLogin: () => ({startAutoGuest: mockStartAutoGuest}),
}));

jest.mock('../src/shared/lib/persistence', () => ({
  getAsyncStorage: jest.fn(),
  setAsyncStorage: jest.fn(),
  removeAsyncStorage: jest.fn(),
}));

const mockGet = getAsyncStorage as jest.Mock;
const mockSet = setAsyncStorage as jest.Mock;

let latest: {pending: boolean} | undefined;

function Probe({isLoading, isLogin}: {isLoading: boolean; isLogin: boolean}) {
  latest = useAutoGuest({isLoading, isLogin});
  return null;
}

const flush = async (cycles = 10) => {
  for (let i = 0; i < cycles; i += 1) {
    await Promise.resolve();
  }
};

async function render(props: {isLoading: boolean; isLogin: boolean}) {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Probe {...props} />);
    await flush();
  });
  return renderer as ReactTestRenderer.ReactTestRenderer;
}

beforeEach(() => {
  jest.clearAllMocks();
  latest = undefined;
  mockSet.mockResolvedValue(undefined);
});

it('첫 실행(세션 이력 없음)이면 게스트를 발급하고, 끝날 때까지 pending', async () => {
  mockGet.mockResolvedValue(null);
  let resolve: () => void = () => {};
  mockStartAutoGuest.mockReturnValue(
    new Promise<void>(r => {
      resolve = r;
    }),
  );

  await render({isLoading: false, isLogin: false});
  expect(mockStartAutoGuest).toHaveBeenCalledTimes(1);
  expect(mockSet).toHaveBeenCalledWith(StorageKey.SESSION_EVER, true);
  expect(latest?.pending).toBe(true);

  await ReactTestRenderer.act(async () => {
    resolve();
    await flush();
  });
  expect(latest?.pending).toBe(false);
});

it('세션이 있었던 기기는 자동 진입하지 않는다(로그아웃·만료 뒤엔 로그인 화면)', async () => {
  mockGet.mockResolvedValue(true);
  await render({isLoading: false, isLogin: false});
  expect(mockStartAutoGuest).not.toHaveBeenCalled();
  expect(latest?.pending).toBe(false);
});

it('이미 세션이 있으면 기다리지 않고 세션 이력을 남긴다', async () => {
  await render({isLoading: false, isLogin: true});
  expect(latest?.pending).toBe(false);
  expect(mockStartAutoGuest).not.toHaveBeenCalled();
  expect(mockSet).toHaveBeenCalledWith(StorageKey.SESSION_EVER, true);
});

it('발급이 실패하면 로그인 화면으로(pending 해제)', async () => {
  mockGet.mockResolvedValue(null);
  mockStartAutoGuest.mockRejectedValue(new Error('network'));
  await render({isLoading: false, isLogin: false});
  expect(latest?.pending).toBe(false);
});

it('세션 확인 중(isLoading)에는 아무것도 하지 않는다', async () => {
  await render({isLoading: true, isLogin: false});
  expect(mockGet).not.toHaveBeenCalled();
  expect(mockStartAutoGuest).not.toHaveBeenCalled();
});
