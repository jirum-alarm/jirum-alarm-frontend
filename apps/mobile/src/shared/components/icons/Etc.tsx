import React from 'react';
import Svg, {Rect, type SvgProps} from 'react-native-svg';

import {useColors} from '@/shared/theme/useColors';

/** web Etc 와 같은 패스. */
export default function Etc({width = 20, height = 20, ...props}: SvgProps) {
  const c = useColors();
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      {...props}>
      <Rect x="3" y="3" width="6" height="6" rx="1" fill="#4AD11B" />
      <Rect x="3" y="11" width="6" height="6" rx="1" fill={c.gray[300]} />
      <Rect x="11" y="3" width="6" height="6" rx="1" fill={c.gray[300]} />
      <Rect x="11" y="11" width="6" height="6" rx="1" fill={c.gray[300]} />
    </Svg>
  );
}
