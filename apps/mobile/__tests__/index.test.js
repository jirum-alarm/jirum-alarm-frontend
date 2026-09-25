const mockRegisterComponent = jest.fn();
const mockSetBackgroundMessageHandler = jest.fn();
const mockMessaging = jest.fn(() => ({
  setBackgroundMessageHandler: mockSetBackgroundMessageHandler,
}));
const mockOnBackgroundMessageHandler = jest.fn();
const mockSetNotificationHandler = jest.fn();
const mockForegroundNotificationBehavior = jest.fn(() => 'behavior');

jest.mock('react-native', () => ({
  AppRegistry: {
    registerComponent: mockRegisterComponent,
  },
}));

jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: mockMessaging,
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: mockSetNotificationHandler,
}));

jest.mock('../gesture-handler', () => ({}));

jest.mock('../App', () => ({
  __esModule: true,
  default: 'App',
}));

jest.mock('../src/shared/lib/fcm/fcm-handler', () => ({
  onBackgroundMessageHandler: mockOnBackgroundMessageHandler,
  foregroundNotificationBehavior: mockForegroundNotificationBehavior,
}));

describe('index.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('registers the background FCM handler before the app component', () => {
    jest.isolateModules(() => {
      require('../index');
    });

    expect(mockSetBackgroundMessageHandler).toHaveBeenCalledWith(
      mockOnBackgroundMessageHandler,
    );
    expect(mockRegisterComponent).toHaveBeenCalledWith(
      'jirumAlarmMobile',
      expect.any(Function),
    );
    expect(
      mockSetBackgroundMessageHandler.mock.invocationCallOrder[0],
    ).toBeLessThan(mockRegisterComponent.mock.invocationCallOrder[0]);
    expect(mockRegisterComponent.mock.calls[0][1]()).toBe('App');
  });

  // expo-notifications 는 핸들러가 없으면 앱이 떠 있을 때 온 푸시를 표시하지 않는다.
  it('registers the foreground notification handler at startup', async () => {
    jest.isolateModules(() => {
      require('../index');
    });

    expect(mockSetNotificationHandler).toHaveBeenCalledTimes(1);
    const {handleNotification} = mockSetNotificationHandler.mock.calls[0][0];
    await expect(handleNotification('n')).resolves.toBe('behavior');
    expect(mockForegroundNotificationBehavior).toHaveBeenCalledWith('n');
  });
});
