import React from 'react';
import {Appearance} from 'react-native';

import ReactQueryProvider from './src/provider/ReactQueryProvider.tsx';
import {NavigationContainer} from '@react-navigation/native';
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
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Sentry, initSentry, wrapApp} from '@/shared/lib/monitoring/sentry.ts';
import useOtaUpdateOnResume from '@/shared/hooks/useOtaUpdateOnResume.ts';

// init 은 컴포넌트 밖에서 — 렌더 시작 전에 나는 에러도 잡아야 한다.
initSentry();

// ★다크모드를 지원하기 전까지 라이트로 고정한다. 설정은 automatic 인데 화면은 전부 흰색이라,
// 다크 기기에선 키보드·알럿·날짜 선택 같은 시스템 UI 만 검게 떠 앱 위에서 따로 놀았다.
// 다크모드를 만들면 이 한 줄을 지운다(네이티브 설정 automatic 은 그대로라 빌드 없이 된다).
Appearance.setColorScheme('light');

function App(): React.JSX.Element {
  const webViewRefManager = useWebViewRefManager();
  useOtaUpdateOnResume();

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <Sentry.ErrorBoundary
          fallback={({resetError}) => (
            <AppErrorFallback onRetry={resetError} />
          )}>
          <KeyboardProvider>
            <NavigationContainer ref={navigationRef}>
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
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Sentry.wrap 은 **init 이 실제로 돈 경우에만** 건다(wrapApp 이 그 판단을 한다).
// init 없이 wrap 하면 앱 시작 계측이 받아줄 클라이언트를 못 찾아 릴리스에서 죽는다.
export default wrapApp(App);
