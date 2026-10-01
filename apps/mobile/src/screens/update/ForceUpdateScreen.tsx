import React from 'react';
import {View, Pressable, StyleSheet, Linking} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {storeUrl} from '@/shared/lib/update/release-policy';

/**
 * 스토어 업데이트가 필요할 때 앱 전체를 덮는 화면.
 *
 * "나중에" 버튼은 두지 않는다. 이 화면이 뜨는 경우는 구버전이 실제로
 * 동작하지 않을 때뿐이라(그래서 최소 버전을 올린 것), 통과시키면
 * 깨진 앱을 쓰게 된다.
 */
export default function ForceUpdateScreen(): React.JSX.Element {
  const openStore = () => {
    Linking.openURL(storeUrl()).catch(() => {
      // 스토어 앱이 없는 기기(에뮬레이터 등)에서는 조용히 무시한다.
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🚀</Text>
      <Text style={styles.title}>새 버전이 필요해요</Text>
      <Text style={styles.description}>
        지금 버전은 더 이상 지원하지 않아요.{'\n'}
        업데이트하고 계속 이용해주세요.
      </Text>
      <Pressable
        style={styles.button}
        onPress={openStore}
        accessibilityRole="button"
        accessibilityLabel="스토어에서 업데이트">
        <Text style={styles.buttonText}>업데이트하기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emoji: {fontSize: 48, marginBottom: 16},
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#667085',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#101828',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonText: {color: '#ffffff', fontSize: 14, fontWeight: '600'},
});
