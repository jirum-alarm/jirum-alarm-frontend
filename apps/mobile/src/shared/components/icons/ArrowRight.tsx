import React from 'react';
import Svg, {Path, type SvgProps} from 'react-native-svg';

import {useColors} from '@/shared/theme/useColors';

/** web ArrowRight 와 같은 패스. */
export default function ArrowRight({
  width = 24,
  height = 25,
  color: colorProp,
  strokeWidth = 1.5,
  ...props
}: SvgProps) {
  const c = useColors();
  const color = colorProp ?? c.gray[600];
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 25"
      fill="none"
      {...props}>
      <Path
        d="M14.62 12.51 7.561 5.433l.91-.91 7.966 7.987-7.967 7.967-.91-.91z"
        stroke={color as string}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
