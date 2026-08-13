import React from 'react';
import {Image} from 'react-native';

/** web TossIcon 과 같은 토스 심볼. */
export default function TossIcon({size = 16}: {size?: number}) {
  return (
    <Image
      source={require('@/shared/assets/toss-symbol.png')}
      style={{width: size, height: size}}
      accessibilityLabel="토스"
    />
  );
}
