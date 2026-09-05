import React from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';

const WebViewLoadingIndicator = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#101828" />
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
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WebViewLoadingIndicator;
