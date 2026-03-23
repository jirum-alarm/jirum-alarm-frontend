const mockRegisterComponent = jest.fn();
const mockSetBackgroundMessageHandler = jest.fn();
const mockMessaging = jest.fn(() => ({
  setBackgroundMessageHandler: mockSetBackgroundMessageHandler,
}));
const mockOnBackgroundMessageHandler = jest.fn();

jest.mock('react-native', () => ({
  AppRegistry: {
    registerComponent: mockRegisterComponent,
  },
}));

jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: mockMessaging,
}));

jest.mock('../gesture-handler', () => ({}));

jest.mock('../App', () => ({
  __esModule: true,
  default: 'App',
}));

jest.mock('../src/shared/lib/fcm/fcm-handler', () => ({
  onBackgroundMessageHandler: mockOnBackgroundMessageHandler,
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
});
