import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {WebView} from 'react-native-webview';

/**
 * 보이지 않는 WebView 하나를 앱이 한가해질 때 띄워 둔다(예열).
 *
 * 첫 WebView 는 iOS WKWebView 프로세스·Android WebView 엔진을 올리느라 수백 ms 가 든다 —
 * 커뮤니티 글쓰기·상세 하위 경로·약관 같은 웹 화면을 처음 열 때 "한 박자 늦는" 원인.
 * 한 번 떠 있으면 이후 WebView 는 이미 올라온 엔진을 쓴다(토스·당근류 하이브리드 앱의 흔한 예열).
 * about:blank 라 네트워크는 쓰지 않는다. 계속 마운트해 둬야 프로세스가 내려가지 않는다.
 * ponytail: 3초 고정 지연 — 첫 화면(홈) 렌더·요청과 겹치지 않을 만큼.
 */
const PREWARM_DELAY_MS = 3000;

export default function WebViewPrewarm() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), PREWARM_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
  if (!ready) return null;
  return (
    <View
      style={styles.hidden}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <WebView source={{uri: 'about:blank'}} style={styles.hidden} />
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {position: 'absolute', width: 1, height: 1, opacity: 0},
});
