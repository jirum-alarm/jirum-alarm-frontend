import React from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {COLORS} from '@/shared/constant/colors.ts';

const WebViewLoadingIndicator = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.GRAY_900} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WebViewLoadingIndicator;
