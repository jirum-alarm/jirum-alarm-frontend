import * as WebBrowser from 'expo-web-browser';
import {Alert, Linking, Platform} from 'react-native';
import {openInAppBrowser} from '../src/shared/lib/navigation/in-app-browser';

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
  WebBrowserPresentationStyle: {
    PAGE_SHEET: 'pageSheet',
  },
}));

describe('openInAppBrowser', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      value: originalPlatform,
    });
  });

  it('opens intent fallback urls on android', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'android'});

    await openInAppBrowser(
      'intent://example.com/path#Intent;scheme=https;S.browser_fallback_url=https%3A%2F%2Fexample.com;end',
    );

    expect(Linking.canOpenURL).toHaveBeenCalledWith('https://example.com');
    expect(Linking.openURL).toHaveBeenCalledWith('https://example.com');
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  it('opens package market fallback when intent package exists', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'android'});
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(false);

    await openInAppBrowser(
      'intent://example.com/path#Intent;scheme=https;package=com.example.app;end',
    );

    expect(Linking.openURL).toHaveBeenCalledWith(
      'market://details?id=com.example.app',
    );
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  it('delegates special schemes to Linking', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});

    await openInAppBrowser('mailto:test@example.com');

    expect(Linking.openURL).toHaveBeenCalledWith('mailto:test@example.com');
    expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
  });

  it('opens standard urls in expo web browser', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});

    await openInAppBrowser('https://example.com');

    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        dismissButtonStyle: 'close',
        presentationStyle: 'pageSheet',
        toolbarColor: '#ffffff',
      }),
    );
  });

  it('falls back to Linking when expo web browser fails', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});
    jest
      .spyOn(WebBrowser, 'openBrowserAsync')
      .mockRejectedValueOnce(new Error('browser failed'));

    await openInAppBrowser('https://example.com');

    expect(Linking.openURL).toHaveBeenCalledWith('https://example.com');
  });

  it('shows an alert when fallback linking also fails', async () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});
    jest
      .spyOn(WebBrowser, 'openBrowserAsync')
      .mockRejectedValueOnce(new Error('browser failed'));
    jest
      .spyOn(Linking, 'openURL')
      .mockRejectedValueOnce(new Error('link fail'));

    await openInAppBrowser('https://example.com');

    expect(Alert.alert).toHaveBeenCalledWith('알림', '링크를 열 수 없습니다.');
  });
});
