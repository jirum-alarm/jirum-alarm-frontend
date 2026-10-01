import React from 'react';
import {View, Pressable, StyleSheet} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {useColors} from '@/shared/theme/useColors';

/**
 * 앱 전체가 죽었을 때의 마지막 화면.
 *
 * 지금까지 루트에 ErrorBoundary 가 없어서, 렌더 중 에러 하나면 RN 이 트리를
 * 통째로 언마운트하고 흰 화면만 남았다(사용자에겐 "앱이 먹통"). 최소한
 * 무슨 일이 났는지 알리고 다시 시도할 길은 준다.
 *
 * 문법은 WebViewErrorView 와 맞춘다 — 같은 앱에서 실패 화면이 둘로 보이지 않게.
 */
export default function AppErrorFallback({
  onRetry,
}: {
  onRetry: () => void;
}): React.JSX.Element {
  const c = useColors();
  return (
    <View style={[styles.container, {backgroundColor: c.white}]}>
      <Text style={styles.emoji}>😵</Text>
      <Text style={[styles.title, {color: c.gray[900]}]}>
        앱에 문제가 생겼어요
      </Text>
      <Text style={[styles.description, {color: c.gray[500]}]}>
        불편을 드려 죄송해요.{'\n'}
        다시 시도해도 계속된다면 앱을 완전히 종료 후 실행해주세요.
      </Text>
      <Pressable
        style={[styles.button, {backgroundColor: c.gray[900]}]}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="다시 시도">
        <Text style={[styles.buttonText, {color: c.white}]}>다시 시도</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
