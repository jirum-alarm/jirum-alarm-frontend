import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import {Linking} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import useDeepLink from '../src/shared/hooks/useDeepLink';
import {openWhenNavigatorReady} from '../src/shared/lib/navigation/open-when-ready';

jest.mock('../src/shared/lib/navigation/open-when-ready', () => ({
  openWhenNavigatorReady: jest.fn(),
}));
jest.mock('../src/shared/lib/analytics/ga4', () => ({
  Analytics: {track: jest.fn()},
}));

// 화면 하네스(scripts/screens-ios.sh)는 앱 저장소에 열 주소를 넣고 콜드 스타트한다 —
// simctl openurl 은 확인 창이 떠서 화면이 안 바뀐다. 그 입구가 딥링크와 같은 길로 열고, 한 번만 여는지 본다.
const KEY = 'jirum:screens-harness-url';
const open = openWhenNavigatorReady as jest.MockedFunction<
  typeof openWhenNavigatorReady
>;

function Probe() {
  useDeepLink(() => {});
  return null;
}

const mount = async (): Promise<ReactTestRenderer.ReactTestRenderer> => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Probe />);
  });
  return renderer!;
};

describe('화면 하네스 입구(useDeepLink)', () => {
  beforeEach(async () => {
    open.mockClear();
    await AsyncStorage.clear();
    jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(null);
    jest
      .spyOn(Linking, 'addEventListener')
      .mockReturnValue({remove: jest.fn()} as unknown as ReturnType<
        typeof Linking.addEventListener
      >);
  });

  it('저장소의 주소를 딥링크처럼 열고 지운다', async () => {
    await AsyncStorage.setItem(KEY, 'jirumalarm://products/1');
    const r = await mount();
    expect(open).toHaveBeenCalledTimes(1);
    expect(open.mock.calls[0][0]).toBe('https://jirum-alarm.com/products/1');
    expect(await AsyncStorage.getItem(KEY)).toBeNull();
    ReactTestRenderer.act(() => r.unmount());
  });

  it('주소가 없으면 아무것도 열지 않는다', async () => {
    const r = await mount();
    expect(open).not.toHaveBeenCalled();
    ReactTestRenderer.act(() => r.unmount());
  });

  it('남의 도메인은 딥링크와 같이 막는다', async () => {
    await AsyncStorage.setItem(KEY, 'https://evil.example.com/x');
    const r = await mount();
    expect(open).not.toHaveBeenCalled();
    ReactTestRenderer.act(() => r.unmount());
  });
});
