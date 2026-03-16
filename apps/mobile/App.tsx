import React, {useRef} from 'react';

import ReactQueryProvider from './src/provider/ReactQueryProvider.tsx';
import {NavigationContainer} from '@react-navigation/native';
import RootNavigator from './src/navigations/root/RootNavigator.tsx';
import './global.css';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import Toast, {type ToastConfig} from 'react-native-toast-message';
import {Text, View} from 'react-native';
import {WebviewRefContext} from '@/provider/WebViewRefProvider.tsx';
import WebView from 'react-native-webview';
import FcmHandler from '@/components/FCMHandler.tsx';
import OfflineBanner from '@/shared/components/OfflineBanner.tsx';
import {SafeAreaProvider} from 'react-native-safe-area-context';

function App(): React.JSX.Element {
  const webviewRef = useRef<WebView>(null);

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <NavigationContainer>
          <ReactQueryProvider>
            <WebviewRefContext.Provider value={{webviewRef}}>
              <FcmHandler>
                <RootNavigator />
              </FcmHandler>
              <OfflineBanner />
            </WebviewRefContext.Provider>
            <Toast config={toastConfig} />
          </ReactQueryProvider>
        </NavigationContainer>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

export default App;

export const toastConfig: ToastConfig = {
  info: ({text1}) => (
    <View className="bg-gray-600 rounded-[8px]">
      <Text className="text-[14px] font-pretendard py-[14px] px-[22.5px] text-white">
        {text1}
      </Text>
    </View>
  ),
};
