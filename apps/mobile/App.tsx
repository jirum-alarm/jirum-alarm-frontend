import React from 'react';

import WebView from 'react-native-webview';
import {SafeAreaView, StyleSheet} from 'react-native';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <WebView source={{uri: 'https://jirum-alarm.com/'}} />
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
