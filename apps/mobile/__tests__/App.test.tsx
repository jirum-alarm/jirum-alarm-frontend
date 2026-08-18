/**
 * @format
 */

import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';

jest.mock('../global.css', () => ({}));
// 네이티브 모듈이라 jest 에서 로드가 안 된다. 래퍼는 children 을 그대로 통과시키면 충분.
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({children}: {children: React.ReactNode}) => children,
}));
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
  // App 이 navigationRef 를 NavigationContainer 에 넘긴다(푸시 → 네이티브 상세).
  createNavigationContainerRef: () => ({
    isReady: () => false,
    navigate: jest.fn(),
  }),
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
// Sentry/expo-updates 도 네이티브 모듈. init 은 no-op, ErrorBoundary·wrap 은 그대로 통과시킨다.
jest.mock('../src/shared/lib/monitoring/sentry.ts', () => ({
  __esModule: true,
  initSentry: jest.fn(),
  setSentryUser: jest.fn(),
  Sentry: {
    wrap: (c: unknown) => c,
    ErrorBoundary: ({children}: {children: React.ReactNode}) => children,
  },
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
