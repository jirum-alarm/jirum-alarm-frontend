import React from 'react';
import {View, StyleSheet} from 'react-native';
import {fixed, light} from '@jirum/design-system';
import {layout} from '@jirum/design-system/layout';
import {Text} from '@/shared/components/ui/Text/AppText';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import useNetworkStatus from '@/shared/hooks/useNetworkStatus';

const OfflineBanner = () => {
  const {isConnected} = useNetworkStatus();
  const insets = useSafeAreaInsets();

  if (isConnected) {
    return null;
  }

  return (
    <View style={[styles.container, {top: insets.top}]}>
      <Text style={styles.text}>인터넷 연결이 끊어졌어요</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: light.error[500], // 테마 무관 빨간 띠
    paddingVertical: 8,
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: layout.layer.toast, // 화면 위 알림 층(layout.js) — 예전 9999
  },
  text: {
    color: fixed.white,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default OfflineBanner;
