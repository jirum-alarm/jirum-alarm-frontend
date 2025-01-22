import React from 'react';
import WebView from 'react-native-webview';
import {Linking, Platform, SafeAreaView, StyleSheet} from 'react-native';
import type {ShouldStartLoadRequest} from 'react-native-webview/lib/WebViewTypes';

const userAgent =
  Platform.OS === 'ios'
    ? 'IOS Flutter Webview Jirum Alarm'
    : 'Android Flutter Webview Jirum Alarm';

function App(): React.JSX.Element {
  const handleShouldStartLoadWithRequest = (event: ShouldStartLoadRequest) => {
    if (
      !event.url.includes('jirum-alarm') ||
      !event.url.startsWith('https://jirum-alarm.com')
    ) {
      Linking.openURL(event.url); // 외부 브라우저에서 열기
      return false;
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        pullToRefreshEnabled
        source={{uri: 'https://jirum-alarm.com/'}}
        userAgent={userAgent}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      />
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
