import React from 'react';
import Svg, {Path, type SvgProps} from 'react-native-svg';

/** web Close 와 같은 패스. */
export default function Close({
  width = 24,
  height = 24,
  color = '#101828',
  ...props
}: SvgProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      {...props}>
      <Path
        d="M6.4 18.654 5.346 17.6l5.6-5.6-5.6-5.6L6.4 5.346l5.6 5.6 5.6-5.6L18.654 6.4l-5.6 5.6 5.6 5.6-1.054 1.054-5.6-5.6z"
        fill={color as string}
      />
    </Svg>
  );
}
