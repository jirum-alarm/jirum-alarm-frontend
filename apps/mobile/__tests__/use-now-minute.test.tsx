import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import {AppState, type AppStateStatus} from 'react-native';

import {useNowMinute} from '../src/shared/hooks/useNow';

// 「N분 전」 문구용 1분 시계 — 1분마다, 그리고 앱이 다시 켜질 때 바로 갱신돼야 한다.
describe('useNowMinute', () => {
  let appStateHandler: ((state: AppStateStatus) => void) | undefined;
  const remove = jest.fn();
  const seen: number[] = [];

  function Probe() {
    seen.push(useNowMinute());
    return null;
  }

  const ms = (iso: string) => new Date(iso).getTime();
  const last = () => seen[seen.length - 1];

  const mount = (): ReactTestRenderer.ReactTestRenderer => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<Probe />);
    });
    return renderer!;
  };

  beforeEach(() => {
    seen.length = 0;
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-10-15T10:00:30+09:00'));
    jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation((_type, handler) => {
        appStateHandler = handler as (state: AppStateStatus) => void;
        return {remove} as unknown as ReturnType<
          typeof AppState.addEventListener
        >;
      });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    appStateHandler = undefined;
  });

  it('분 단위로 내린 지금 시각을 주고, 1분 뒤 갱신한다', () => {
    const renderer = mount();
    expect(last()).toBe(ms('2026-10-15T10:00:00+09:00'));

    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(60_000);
    });
    expect(last()).toBe(ms('2026-10-15T10:01:00+09:00'));
    ReactTestRenderer.act(() => renderer.unmount());
  });

  it('백그라운드에서 돌아오면 바로 갱신하고, 구독이 없으면 리스너를 지운다', () => {
    const renderer = mount();

    jest.setSystemTime(new Date('2026-10-15T12:30:10+09:00'));
    ReactTestRenderer.act(() => {
      appStateHandler?.('active');
    });
    expect(last()).toBe(ms('2026-10-15T12:30:00+09:00'));

    ReactTestRenderer.act(() => renderer.unmount());
    expect(remove).toHaveBeenCalled();
  });

  it('쉬고 있다가 처음 마운트돼도 옛 시각으로 그리지 않는다', () => {
    const first = mount();
    ReactTestRenderer.act(() => first.unmount());

    jest.setSystemTime(new Date('2026-10-15T15:00:05+09:00'));
    seen.length = 0;
    const renderer = mount();
    // 첫 렌더부터 지금 시각이어야 한다(옛 10:00 으로 한 번 그렸다 고치면 깜빡인다).
    expect(seen[0]).toBe(ms('2026-10-15T15:00:00+09:00'));
    ReactTestRenderer.act(() => renderer.unmount());
  });
});
