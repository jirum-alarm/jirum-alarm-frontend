export {};

/**
 * 네이티브 로그인(이메일·소셜 공용 handleLoginSuccess)이 푸시 토큰을 계정에 묶는지.
 * 웹뷰 로그인 시절엔 AuthBridge.login 이 하던 일이라, 네이티브로 옮기며 고아가 됐었다.
 */
const mockBind = jest.fn(() => Promise.resolve());
jest.mock('../src/shared/lib/fcm/push-permission', () => ({
  bindFcmTokenToUser: () => mockBind(),
}));
const mockSet = jest.fn((_key: string, _value: string) => Promise.resolve());
jest.mock('../src/shared/lib/persistence', () => ({
  setAsyncStorage: (key: string, value: string) => mockSet(key, value),
  removeAsyncStorage: jest.fn(() => Promise.resolve()),
}));
jest.mock('../src/shared/lib/feedback', () => ({
  showToast: {info: jest.fn(), error: jest.fn()},
}));

const {handleLoginSuccess} = require('../src/screens/auth/useSocialLogin/lib');

beforeEach(() => jest.clearAllMocks());

it('토큰을 저장한 뒤 푸시 토큰을 계정에 묶는다', async () => {
  await handleLoginSuccess('access', 'refresh');
  expect(mockBind).toHaveBeenCalledTimes(1);
  // 묶기 요청은 access token 이 저장된 뒤여야 계정으로 인식된다.
  expect(mockSet.mock.invocationCallOrder.at(-1)).toBeLessThan(
    mockBind.mock.invocationCallOrder[0],
  );
});

it('토큰이 없는 응답이면 묶지 않는다', async () => {
  const err = jest.spyOn(console, 'error').mockImplementation(() => {});
  await handleLoginSuccess(undefined, null);
  expect(mockBind).not.toHaveBeenCalled();
  err.mockRestore();
});
