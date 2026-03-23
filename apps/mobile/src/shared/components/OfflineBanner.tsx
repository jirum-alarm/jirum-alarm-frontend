import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
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
      <Text style={styles.text}>인터넷 연결이 끊어졌습니다</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    alignItems: 'center',
    pointerEvents: 'none',
    zIndex: 9999,
  },
  text: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default OfflineBanner;
