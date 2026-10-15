import React from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';

import {useColors} from '@/shared/theme/useColors';

const WebViewLoadingIndicator = () => {
  // 바탕·스피너는 테마 값 — 흰 판 고정이면 다크 웹뷰가 뜰 때마다 흰 화면이 번쩍였다.
  const c = useColors();
  return (
    <View style={[styles.container, {backgroundColor: c.white}]}>
      <ActivityIndicator size="large" color={c.gray[900]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // RN 0.86 에서 StyleSheet.absoluteFillObject 가 사라진다(절대경로 값을 직접 쓴다).
    // absoluteFill 은 등록된 스타일 ID 라 스프레드가 안 되므로 값을 편다.
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WebViewLoadingIndicator;
