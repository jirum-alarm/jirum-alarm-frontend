/**
 * OTA 를 콜드 스타트 밖에서도 받게 한다 — 앱을 백그라운드에 둔 채 쓰는 유저는
 * 콜드 스타트가 드물어 수정본이 한참 늦게 닿았다.
 */
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import {AppState, type AppStateStatus} from 'react-native';

const mockUpdates = {
  isEnabled: true,
  isUpdatePending: false,
  reloadAsync: jest.fn(() => Promise.resolve()),
  checkForUpdateAsync: jest.fn(() => Promise.resolve({isAvailable: false})),
  fetchUpdateAsync: jest.fn(() => Promise.resolve({})),
};
jest.mock('expo-updates', () => ({
  get isEnabled() {
    return mockUpdates.isEnabled;
  },
  useUpdates: () => ({isUpdatePending: mockUpdates.isUpdatePending}),
  reloadAsync: () => mockUpdates.reloadAsync(),
  checkForUpdateAsync: () => mockUpdates.checkForUpdateAsync(),
  fetchUpdateAsync: () => mockUpdates.fetchUpdateAsync(),
}));

import useOtaUpdateOnResume, {
  RELOAD_AFTER_BACKGROUND_MS,
  decideOnResume,
} from '../src/shared/hooks/useOtaUpdateOnResume';

describe('decideOnResume', () => {
  it('받아둔 업데이트 + 오래 떠나 있었으면 적용한다', () => {
    expect(decideOnResume(RELOAD_AFTER_BACKGROUND_MS, true)).toBe('reload');
  });
  it('잠깐 나갔다 온 거면 보던 화면을 지킨다', () => {
    expect(decideOnResume(RELOAD_AFTER_BACKGROUND_MS - 1, true)).toBe('check');
  });
  it('받아둔 게 없으면 확인만 한다', () => {
    expect(decideOnResume(RELOAD_AFTER_BACKGROUND_MS * 10, false)).toBe(
      'check',
    );
  });
});

describe('useOtaUpdateOnResume', () => {
  let listener: ((s: AppStateStatus) => Promise<void>) | undefined;
  let now = 0;
  const realDev = (globalThis as {__DEV__?: boolean}).__DEV__;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdates.isEnabled = true;
    mockUpdates.isUpdatePending = false;
    (globalThis as {__DEV__?: boolean}).__DEV__ = false;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((
      _: string,
      l: (s: AppStateStatus) => Promise<void>,
    ) => {
      listener = l;
      return {remove: jest.fn()};
    }) as never);
  });
  afterEach(() => {
    (globalThis as {__DEV__?: boolean}).__DEV__ = realDev;
    jest.restoreAllMocks();
    listener = undefined;
  });

  function Harness() {
    useOtaUpdateOnResume();
    return null;
  }
  const mount = () =>
    ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<Harness />);
    });
  const goAwayFor = async (ms: number) => {
    now = 1_000;
    await listener?.('background');
    now += ms;
    await listener?.('active');
  };

  it('복귀하면 새 업데이트를 확인해 받아둔다(적용은 안 한다)', async () => {
    mockUpdates.checkForUpdateAsync.mockResolvedValueOnce({isAvailable: true});
    await mount();
    await goAwayFor(1_000);
    expect(mockUpdates.fetchUpdateAsync).toHaveBeenCalledTimes(1);
    expect(mockUpdates.reloadAsync).not.toHaveBeenCalled();
  });

  it('받아둔 업데이트가 있고 30분+ 떠나 있었으면 적용한다', async () => {
    mockUpdates.isUpdatePending = true;
    await mount();
    await goAwayFor(RELOAD_AFTER_BACKGROUND_MS);
    expect(mockUpdates.reloadAsync).toHaveBeenCalledTimes(1);
  });

  it('dev 빌드에선 아무것도 안 한다(expo-updates 가 꺼져 있어 던진다)', async () => {
    (globalThis as {__DEV__?: boolean}).__DEV__ = true;
    await mount();
    expect(listener).toBeUndefined();
  });

  it('확인 실패는 삼킨다', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockUpdates.checkForUpdateAsync.mockRejectedValueOnce(new Error('net'));
    await mount();
    await expect(goAwayFor(1_000)).resolves.toBeUndefined();
    log.mockRestore();
  });
});
