import React, {useEffect} from 'react';

import ReactQueryProvider from './src/provider/ReactQueryProvider.tsx';
import {MixpanelService} from '@/shared/lib/analytics/mixpanel.ts';
import {NavigationContainer} from '@react-navigation/native';
import {navigationRef} from '@/navigations/navigation-ref.ts';
import RootNavigator from './src/navigations/root/RootNavigator.tsx';
import './global.css';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import Toast, {type ToastConfig} from 'react-native-toast-message';
import {Text, View} from 'react-native';
import {
  WebviewRefContext,
  useWebViewRefManager,
} from '@/provider/WebViewRefProvider.tsx';
import FcmHandler from '@/components/FCMHandler.tsx';
import OfflineBanner from '@/shared/components/OfflineBanner.tsx';
import AppErrorFallback from '@/shared/components/AppErrorFallback.tsx';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Sentry, initSentry, wrapApp} from '@/shared/lib/monitoring/sentry.ts';

// init 은 컴포넌트 밖에서 — 렌더 시작 전에 나는 에러도 잡아야 한다.
initSentry();

function App(): React.JSX.Element {
  const webViewRefManager = useWebViewRefManager();

  useEffect(() => {
    // 앱 진입 시 분석 SDK 초기화(토큰 없으면 no-op). identify/track 은 로그인 흐름에서.
    MixpanelService.init();
  }, []);

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

export const toastConfig: ToastConfig = {
  info: ({text1}) => (
    <View className="bg-gray-600 rounded-[8px]">
      <Text className="text-[14px] font-pretendard py-[14px] px-[22.5px] text-white">
        {text1}
      </Text>
    </View>
  ),
};
