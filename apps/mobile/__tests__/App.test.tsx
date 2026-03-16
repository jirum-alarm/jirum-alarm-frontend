/**
 * @format
 */

import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';

jest.mock('../global.css', () => ({}));
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
}));
jest.mock('react-native-keyboard-controller', () => ({
  KeyboardProvider: ({children}: {children: React.ReactNode}) => children,
}));
jest.mock('react-native-toast-message', () => {
  return {
    __esModule: true,
    default: () => null,
  };
});
jest.mock('../src/provider/ReactQueryProvider.tsx', () => ({
  __esModule: true,
  default: ({children}: {children: React.ReactNode}) => children,
}));
jest.mock('../src/components/FCMHandler.tsx', () => ({
  __esModule: true,
  default: ({children}: {children: React.ReactNode}) => children,
}));
jest.mock('../src/shared/components/OfflineBanner.tsx', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../src/navigations/root/RootNavigator.tsx', () => ({
  __esModule: true,
  default: () => null,
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
