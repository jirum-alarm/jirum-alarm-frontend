export {};

/**
 * 분석 호출이 앱 흐름을 막지 않는다.
 *
 * 🔴`analytics()` 는 네이티브 모듈이 없으면 **동기로 던진다**. `.catch()` 만
 * 걸어두면 프라미스가 만들어지기도 전에 예외가 호출부까지 올라간다 —
 * iOS 26 시뮬레이터에서 딥링크를 열자 앱이 레드스크린으로 죽었다
 * (`Analytics.track` → `useDeepLink.open` → `Linking.addEventListener`).
 * ⚠️JS 만 나가는 OTA 업데이트를 받은 설치 앱도 같은 상태가 된다.
 */
const throwing = jest.fn(() => {
  throw new Error(
    "You attempted to use a Firebase module that's not installed natively",
  );
});
const rejecting = jest.fn(() => ({
  logEvent: () => Promise.reject(new Error('network')),
  setUserId: () => Promise.reject(new Error('network')),
}));
// ⚠️jest.mock 팩토리는 `mock` 접두어 변수만 참조할 수 있다.
let mockImpl: () => unknown = rejecting;

jest.mock('@react-native-firebase/analytics', () => ({
  __esModule: true,
  default: () => mockImpl(),
}));

const {Analytics} = require('../src/shared/lib/analytics/ga4');

describe('Analytics — 실패가 흐름을 막지 않는다', () => {
  const errorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);

  afterAll(() => errorSpy.mockRestore());
  beforeEach(() => {
    errorSpy.mockClear();
    throwing.mockClear();
  });

  it('네이티브 모듈이 없어 동기로 던져도 호출부로 올라오지 않는다', () => {
    mockImpl = throwing;
    // 여기서 예외가 새면 딥링크·로그인 흐름이 통째로 멈춘다.
    expect(() => Analytics.track('deeplink_opened', {url: '/x'})).not.toThrow();
    expect(() => Analytics.identify('u1')).not.toThrow();
    expect(() => Analytics.reset()).not.toThrow();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('프라미스 거절도 삼킨다', async () => {
    mockImpl = rejecting;
    expect(() => Analytics.track('x')).not.toThrow();
    await Promise.resolve();
    await Promise.resolve();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('★같은 실패는 한 번만 로그한다 — 호출마다 찍으면 로그가 흐른다', () => {
    // 네이티브 모듈 부재는 실행 내내 유지되는 조건이다. dev 에선 LogBox
    // 토스트가 화면 하단을 덮어 시뮬레이터 검증까지 막았다.
    mockImpl = throwing;
    Analytics.track('repeat_me');
    Analytics.track('repeat_me');
    Analytics.track('repeat_me');
    expect(errorSpy).toHaveBeenCalledTimes(1);
    // 로그만 줄인다 — 호출 자체는 매번 시도한다(모듈이 나중에 붙을 수 있다).
    expect(throwing).toHaveBeenCalledTimes(3);
  });

  it('userId 가 비면 아무것도 부르지 않는다', () => {
    mockImpl = throwing;
    Analytics.identify('');
    expect(throwing).not.toHaveBeenCalled();
  });
});
