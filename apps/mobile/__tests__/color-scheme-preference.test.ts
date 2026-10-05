/**
 * 내정보 > 화면 모드. 저장된 선택을 앱 시작 때 Appearance 에 다시 건다.
 * 'system' 은 아무것도 걸지 않아야 한다(OS 설정 그대로) — 여기서 'light' 를 걸면 다크 사용자가 갇힌다.
 */
import {Appearance} from 'react-native';

const mockStored: {value: unknown} = {value: null};
jest.mock('../src/shared/lib/persistence/async-storage', () => ({
  getAsyncStorage: () => Promise.resolve(mockStored.value),
  setAsyncStorage: () => Promise.resolve(),
}));

import {restoreColorSchemePreference} from '../src/shared/theme/color-scheme-preference';

const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0));

describe('restoreColorSchemePreference', () => {
  let spy: jest.SpyInstance;
  beforeEach(() => {
    spy = jest.spyOn(Appearance, 'setColorScheme').mockImplementation(() => {});
  });
  afterEach(() => spy.mockRestore());

  it.each([
    ['dark', 'dark'],
    ['light', 'light'],
  ])('저장값 %s → %s 로 고정', async (stored, expected) => {
    mockStored.value = stored;
    restoreColorSchemePreference();
    await flush();
    expect(spy).toHaveBeenCalledWith(expected);
  });

  it.each([['system'], [null], ['weird']])(
    '저장값 %s → 손대지 않는다(OS 설정)',
    async stored => {
      mockStored.value = stored;
      restoreColorSchemePreference();
      await flush();
      expect(spy).not.toHaveBeenCalled();
    },
  );
});
