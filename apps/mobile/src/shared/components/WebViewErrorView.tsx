import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {COLORS} from '@/shared/constant/colors.ts';
import {TYPOGRAPHY} from '@/shared/constant/typography.ts';

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
    ...StyleSheet.absoluteFillObject,
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
    ...TYPOGRAPHY.title18b,
    color: COLORS.GRAY_900,
    marginBottom: 8,
  },
  description: {
    ...TYPOGRAPHY.body14r,
    color: COLORS.GRAY_500,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: COLORS.GRAY_900,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    ...TYPOGRAPHY.body14sb,
    color: COLORS.WHITE,
  },
});

export default WebViewErrorView;
