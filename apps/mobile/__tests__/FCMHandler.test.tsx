import * as Notifications from 'expo-notifications';
import messaging from '@react-native-firebase/messaging';
import * as ReactTestRenderer from 'react-test-renderer';
import FCMHandler from '../src/components/FCMHandler';
import {useWebviewContext} from '../src/provider/WebViewRefProvider';
import useFCMTokenManager from '../src/shared/hooks/useFCMTokenManager.ts';
import {onForegroundMessageHandler} from '../src/shared/lib/fcm/index.ts';

const mockGetInitialNotification = jest.fn();
const mockOnMessage = jest.fn();
const mockOnNotificationOpenedApp = jest.fn();
const mockUnsubscribeMessage = jest.fn();
const mockUnsubscribeOpenedApp = jest.fn();
const mockAddNotificationResponseReceivedListener = jest.fn();
const mockRemoveNotificationSubscription = jest.fn();
const mockUseFCMTokenManager = useFCMTokenManager as jest.Mock;
const mockUseWebviewContext = useWebviewContext as jest.Mock;
const mockForegroundMessageHandler = onForegroundMessageHandler as jest.Mock;
const mockMessaging = messaging as unknown as jest.Mock;
const mockNotifications = Notifications as unknown as {
  addNotificationResponseReceivedListener: jest.Mock;
};
const mockInjectJavaScript = jest.fn();
const mockWebviewRef = {
  current: {
    injectJavaScript: mockInjectJavaScript,
  },
};

jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  __esModule: true,
  addNotificationResponseReceivedListener: jest.fn(),
}));

// ★알림 쿼리 키를 실제 정의(NotificationQueries)에서 가져오므로 그 import 사슬이
// AsyncStorage(네이티브 모듈)까지 닿는다. 이 레포 관행대로 mock 으로 끊는다 —
// 키를 문자열로 복제하면 정의와 갈라져서 무효화가 조용히 빗나간다.
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
  removeItem: jest.fn(async () => {}),
}));

jest.mock('../src/shared/hooks/useFCMTokenManager.ts', () => jest.fn());

jest.mock('../src/shared/lib/fcm/index.ts', () => ({
  onForegroundMessageHandler: jest.fn(),
}));

jest.mock('../src/provider/WebViewRefProvider.tsx', () => ({
  useWebviewContext: jest.fn(),
}));

/**
 * 네비게이터 상태를 테스트가 직접 쥔다 — 열기 루프(open-when-ready)는 진짜로 돈다.
 * 기본값: 탭이 떠 있고 네이티브 화면이 없음 → 웹뷰 주입 경로.
 */
const mockNavigateToNativeRoute = jest.fn((_url: string, _o?: object) => false);
const mockAreNativeTabsMounted = jest.fn(() => true);
jest.mock('../src/navigations/navigation-ref', () => ({
  navigateToNativeRoute: (url: string, o?: object) =>
    mockNavigateToNativeRoute(url, o),
  areNativeTabsMounted: () => mockAreNativeTabsMounted(),
}));

const mockTrack = jest.fn();
jest.mock('../src/shared/lib/analytics/ga4', () => ({
  Analytics: {track: (...args: unknown[]) => mockTrack(...args)},
}));

const flushMicrotasks = async (cycles = 5) => {
  for (let index = 0; index < cycles; index += 1) {
    await Promise.resolve();
  }
};

const renderHandler = async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<FCMHandler />);
    await flushMicrotasks();
  });

  if (renderer === undefined) {
    throw new Error('FCMHandler renderer was not created');
  }

  return renderer;
};

describe('FCMHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockUseFCMTokenManager.mockImplementation(() => undefined);
    mockUseWebviewContext.mockReturnValue({
      webviewRef: mockWebviewRef,
      getWebViewRefByUrl: jest.fn(() => null),
    });
    mockGetInitialNotification.mockResolvedValue(null);
    mockOnMessage.mockImplementation(() => mockUnsubscribeMessage);
    mockOnNotificationOpenedApp.mockImplementation(
      () => mockUnsubscribeOpenedApp,
    );
    mockAddNotificationResponseReceivedListener.mockImplementation(() => ({
      remove: mockRemoveNotificationSubscription,
    }));
    mockMessaging.mockImplementation(() => ({
      getInitialNotification: mockGetInitialNotification,
      onMessage: mockOnMessage,
      onNotificationOpenedApp: mockOnNotificationOpenedApp,
    }));
    mockNotifications.addNotificationResponseReceivedListener.mockImplementation(
      mockAddNotificationResponseReceivedListener,
    );
    mockWebviewRef.current = {
      injectJavaScript: mockInjectJavaScript,
    };
    mockNavigateToNativeRoute.mockImplementation(() => false);
    mockAreNativeTabsMounted.mockImplementation(() => true);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  /**
   * ★예전엔 첫 시도가 무조건 1초 뒤였다(1000 + n×500ms). 탭이 이미 떠 있으면 기다릴 이유가 없다.
   */
  it('콜드 스타트 알림 — 탭이 떠 있으면 기다리지 않고 바로 상세로 간다', async () => {
    mockGetInitialNotification.mockResolvedValue({data: {link: '/products/1'}});
    mockNavigateToNativeRoute.mockImplementation(() => true);

    const renderer = await renderHandler();

    expect(mockUseFCMTokenManager).toHaveBeenCalled();
    expect(mockNavigateToNativeRoute).toHaveBeenCalledWith('/products/1', {
      allowWebViewRoute: true,
    });
    expect(mockInjectJavaScript).not.toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  it('콜드 스타트 알림 — 탭이 아직 안 떴으면 300ms 마다 보다가 뜨는 즉시 연다', async () => {
    mockGetInitialNotification.mockResolvedValue({
      data: {link: '/products/11'},
    });
    let tabsMounted = false;
    mockAreNativeTabsMounted.mockImplementation(() => tabsMounted);
    mockNavigateToNativeRoute.mockImplementation(() => tabsMounted);

    const renderer = await renderHandler();
    expect(mockNavigateToNativeRoute).toHaveBeenCalledTimes(1);

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(mockNavigateToNativeRoute).toHaveBeenCalledTimes(2);

    tabsMounted = true;
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(mockNavigateToNativeRoute).toHaveBeenCalledTimes(3);
    expect(mockNavigateToNativeRoute).toHaveLastReturnedWith(true);

    // 열었으면 더 시도하지 않는다.
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(mockNavigateToNativeRoute).toHaveBeenCalledTimes(3);
    expect(mockInjectJavaScript).not.toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  /**
   * ★실행 중 탭도 같은 루프 — 예전엔 단발 시도라 부팅 창에 오면 웹뷰 주입(홈엔 대상 없음)으로 흘렸다.
   * 안드로이드 콜드 스타트는 expo 응답 리스너가 먼저 올 수 있고, 그걸 흘리면 중복 판정 때문에
   * getInitialNotification 경로까지 버려져 링크가 사라진다.
   */
  it('포그라운드·백그라운드 알림도 탭이 뜰 때까지 기다린다', async () => {
    let tabsMounted = false;
    mockAreNativeTabsMounted.mockImplementation(() => tabsMounted);
    mockNavigateToNativeRoute.mockImplementation(() => tabsMounted);

    const renderer = await renderHandler();
    const foregroundEventHandler =
      mockAddNotificationResponseReceivedListener.mock.calls[0][0];

    ReactTestRenderer.act(() => {
      foregroundEventHandler({
        notification: {request: {content: {data: {link: '/products/5'}}}},
      });
    });
    expect(mockInjectJavaScript).not.toHaveBeenCalled();

    tabsMounted = true;
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(300);
    });
    expect(mockNavigateToNativeRoute).toHaveLastReturnedWith(true);
    expect(mockInjectJavaScript).not.toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  it('끝내 탭이 안 뜨면(10초) 웹뷰 경로로 넘기고 기록을 남긴다', async () => {
    mockGetInitialNotification.mockResolvedValue({
      data: {link: '/products/12'},
    });
    mockAreNativeTabsMounted.mockImplementation(() => false);

    const renderer = await renderHandler();
    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(9000);
    });
    expect(mockInjectJavaScript).not.toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(1500);
    });
    expect(mockInjectJavaScript).toHaveBeenCalledWith(
      'window.location.href = "/products/12";',
    );
    expect(mockTrack).toHaveBeenCalledWith(
      'route_open_timeout',
      expect.objectContaining({url: '/products/12', source: 'push'}),
    );

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  it('routes foreground and background notification clicks to the WebView', async () => {
    const renderer = await renderHandler();
    const openedAppHandler = mockOnNotificationOpenedApp.mock.calls[0][0];
    const foregroundEventHandler =
      mockAddNotificationResponseReceivedListener.mock.calls[0][0];

    ReactTestRenderer.act(() => {
      openedAppHandler({
        data: {
          link: '/products/2',
        },
      });
      foregroundEventHandler({
        notification: {
          request: {
            content: {
              data: {
                link: '/products/3',
              },
            },
          },
        },
      });
    });

    expect(mockOnMessage).toHaveBeenCalledWith(mockForegroundMessageHandler);
    expect(mockInjectJavaScript).toHaveBeenNthCalledWith(
      1,
      'window.location.href = "/products/2";',
    );
    expect(mockInjectJavaScript).toHaveBeenNthCalledWith(
      2,
      'window.location.href = "/products/3";',
    );

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  // 안드로이드는 한 번 탭에 RNFB·expo 두 경로가 다 부른다(2026-10-09 에뮬레이터 실측) — 한 번만 열고 한 번만 센다.
  it('같은 알림이 두 경로로 와도 한 번만 연다', async () => {
    const renderer = await renderHandler();
    const openedAppHandler = mockOnNotificationOpenedApp.mock.calls[0][0];
    const foregroundEventHandler =
      mockAddNotificationResponseReceivedListener.mock.calls[0][0];
    const data = {link: '/products/9', target_id: '9'};

    ReactTestRenderer.act(() => {
      foregroundEventHandler({notification: {request: {content: {data}}}});
      openedAppHandler({data});
    });

    expect(mockInjectJavaScript).toHaveBeenCalledTimes(1);

    // 시간이 지나 같은 딜 알림을 다시 누르면 다시 연다.
    jest.advanceTimersByTime(6000);
    ReactTestRenderer.act(() => {
      openedAppHandler({data});
    });
    expect(mockInjectJavaScript).toHaveBeenCalledTimes(2);

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });
  });

  it('ignores notification payloads that do not include a link and cleans up listeners', async () => {
    mockGetInitialNotification.mockResolvedValue({
      data: {},
    });

    const renderer = await renderHandler();
    const openedAppHandler = mockOnNotificationOpenedApp.mock.calls[0][0];
    const foregroundEventHandler =
      mockAddNotificationResponseReceivedListener.mock.calls[0][0];

    await ReactTestRenderer.act(async () => {
      openedAppHandler({
        data: {},
      });
      foregroundEventHandler({
        notification: {
          request: {
            content: {
              data: {},
            },
          },
        },
      });
      jest.advanceTimersByTime(5000);
      await flushMicrotasks();
    });

    expect(mockInjectJavaScript).not.toHaveBeenCalled();

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });

    expect(mockUnsubscribeMessage).toHaveBeenCalled();
    expect(mockUnsubscribeOpenedApp).toHaveBeenCalled();
    expect(mockRemoveNotificationSubscription).toHaveBeenCalled();
  });
});
