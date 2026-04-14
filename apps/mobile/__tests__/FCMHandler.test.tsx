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

jest.mock('../src/shared/hooks/useFCMTokenManager.ts', () => jest.fn());

jest.mock('../src/shared/lib/fcm/index.ts', () => ({
  onForegroundMessageHandler: jest.fn(),
}));

jest.mock('../src/provider/WebViewRefProvider.tsx', () => ({
  useWebviewContext: jest.fn(),
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
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('routes cold-start notification links into the WebView after the bootstrap delay', async () => {
    mockGetInitialNotification.mockResolvedValue({
      data: {
        link: '/products/1',
      },
    });

    const renderer = await renderHandler();

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(1000);
      await flushMicrotasks();
    });

    expect(mockUseFCMTokenManager).toHaveBeenCalled();
    expect(mockInjectJavaScript).toHaveBeenCalledTimes(1);
    expect(mockInjectJavaScript.mock.calls[0][0]).toContain(
      'window.location.href = "/products/1";',
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
