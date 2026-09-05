/**
 * WebView 첫 진입에 흰 화면이 보이지 않는지 지킨다.
 *
 * 예전엔 오버레이를 1초 지연시켰다(빠른 로드에서 스피너가 번쩍이는 걸 피하려고).
 * 그런데 화면이 push 되는 순간 WebView 는 아직 아무것도 안 그린 상태라,
 * 그 1초가 통째로 흰 화면이었다 — 지연이 스피너 대신 흰 화면을 산 셈.
 * 지연을 되살리는 회귀를 막는다.
 */
import * as ReactTestRenderer from 'react-test-renderer';
import {useWebViewLoading} from '../src/screens/jirumalarmwebview/hooks/useWebViewLoading';

type Loading = ReturnType<typeof useWebViewLoading>;

let latest: Loading | undefined;

const Consumer = () => {
  latest = useWebViewLoading();
  return null;
};

const render = () => {
  ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<Consumer />);
  });
  if (!latest) throw new Error('renderer was not created');
  return () => latest as Loading;
};

const progress = (value: number) =>
  ({nativeEvent: {progress: value}} as Parameters<
    Loading['handleLoadProgress']
  >[0]);

describe('WebView 첫 진입 커버', () => {
  beforeEach(() => {
    latest = undefined;
  });

  it('마운트 즉시 덮여 있다 — 첫 프레임에 흰 화면이 안 보이도록', () => {
    const get = render();
    expect(get().isLoading).toBe(true);
  });

  it('페인트가 끝나면 걷어낸다', () => {
    const get = render();
    ReactTestRenderer.act(() => get().handleLoadEnd());
    expect(get().isLoading).toBe(false);
  });

  it('progress 0.98 이상이면 걷어낸다', () => {
    const get = render();
    ReactTestRenderer.act(() => get().handleLoadProgress(progress(0.98)));
    expect(get().isLoading).toBe(false);
  });

  it('두 번째 로드부터는 덮지 않는다 — SPA 이동마다 깜빡이면 안 된다', () => {
    const get = render();
    ReactTestRenderer.act(() => get().handleLoadEnd());
    ReactTestRenderer.act(() => get().handleLoadStart());
    expect(get().isLoading).toBe(false);
  });

  it('첫 로드는 타이머 없이 동기적으로 덮인다', () => {
    jest.useFakeTimers();
    try {
      const get = render();
      ReactTestRenderer.act(() => get().clearLoadingState());
      expect(get().isLoading).toBe(false);

      // 타이머를 전혀 진행시키지 않아도 즉시 true 여야 한다.
      ReactTestRenderer.act(() => get().handleLoadStart());
      expect(get().isLoading).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });
});
