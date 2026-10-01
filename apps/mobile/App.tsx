import React, {useMemo} from 'react';
import {useColorScheme} from 'react-native';

import ReactQueryProvider from './src/provider/ReactQueryProvider.tsx';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import {navigationRef} from '@/navigations/navigation-ref.ts';
import RootNavigator from './src/navigations/root/RootNavigator.tsx';
import './global.css';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';
import {toastConfig} from '@/shared/components/AppToast';
import {
  WebviewRefContext,
  useWebViewRefManager,
} from '@/provider/WebViewRefProvider.tsx';
import FcmHandler from '@/components/FCMHandler.tsx';
import OfflineBanner from '@/shared/components/OfflineBanner.tsx';
import WebViewPrewarm from '@/shared/components/WebViewPrewarm';
import AppErrorFallback from '@/shared/components/AppErrorFallback.tsx';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import WindowControlsSafeArea from '@/shared/components/WindowControlsSafeArea';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Sentry, initSentry, wrapApp} from '@/shared/lib/monitoring/sentry.ts';
import useOtaUpdateOnResume from '@/shared/hooks/useOtaUpdateOnResume.ts';
import {useColors} from '@/shared/theme/useColors';

// init 은 컴포넌트 밖에서 — 렌더 시작 전에 나는 에러도 잡아야 한다.
initSentry();

// 다크모드는 OS 설정을 따른다(app.json·Info.plist userInterfaceStyle=automatic).
// 색은 src/shared/theme/palette.js 한 곳 — className 토큰이 다크에서 값만 바뀐다.

/** react-navigation 기본 바탕(전환 중 보이는 면·카드)도 같은 palette 로. */
function useNavigationTheme(): Theme {
  const isDark = useColorScheme() === 'dark';
  const c = useColors();
  return useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: c.gray[900],
        background: c.white,
        card: c.white,
        text: c.gray[900],
        border: c.gray[200],
      },
    };
  }, [isDark, c]);
}

function App(): React.JSX.Element {
  const webViewRefManager = useWebViewRefManager();
  const navigationTheme = useNavigationTheme();
  useOtaUpdateOnResume();

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <WindowControlsSafeArea>
          <Sentry.ErrorBoundary
            fallback={({resetError}) => (
              <AppErrorFallback onRetry={resetError} />
            )}>
            <KeyboardProvider>
              <NavigationContainer ref={navigationRef} theme={navigationTheme}>
                <ReactQueryProvider>
                  <WebviewRefContext.Provider value={webViewRefManager}>
                    <FcmHandler>
                      <RootNavigator />
                    </FcmHandler>
                    <OfflineBanner />
                    <WebViewPrewarm />
                  </WebviewRefContext.Provider>
                  <Toast config={toastConfig} />
                </ReactQueryProvider>
              </NavigationContainer>
            </KeyboardProvider>
          </Sentry.ErrorBoundary>
        </WindowControlsSafeArea>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Sentry.wrap 은 **init 이 실제로 돈 경우에만** 건다(wrapApp 이 그 판단을 한다).
// init 없이 wrap 하면 앱 시작 계측이 받아줄 클라이언트를 못 찾아 릴리스에서 죽는다.
export default wrapApp(App);
