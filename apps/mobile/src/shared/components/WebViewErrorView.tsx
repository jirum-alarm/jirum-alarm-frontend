import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';

interface WebViewErrorViewProps {
  onRetry: () => void;
}

const WebViewErrorView = ({onRetry}: WebViewErrorViewProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>😵</Text>
      <Text style={styles.title}>페이지를 불러올 수 없습니다</Text>
      <Text style={styles.description}>
        네트워크 연결을 확인하고 다시 시도해주세요
      </Text>
      <Pressable style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>다시 시도</Text>
      </Pressable>
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
    padding: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#667085',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#101828',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WebViewErrorView;
