import React from 'react';
import Svg, {Path, type SvgProps} from 'react-native-svg';

/** web ArrowRight 와 같은 패스. */
export default function ArrowRight({
  width = 24,
  height = 25,
  color = '#475467',
  strokeWidth = 1.5,
  ...props
}: SvgProps) {
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
