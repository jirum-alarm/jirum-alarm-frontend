import React from 'react';
import Svg, {Path, type SvgProps} from 'react-native-svg';

/** web XSmall 과 같은 패스. 알림 편집모드의 삭제(X) 버튼. */
export default function XSmall({
  width = 20,
  height = 20,
  color = '#667085',
  ...props
}: SvgProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      {...props}>
      <Path
        d="M15.7143 4.28577L4.28571 15.7143M4.28571 4.28577L15.7143 15.7143"
        stroke={color as string}
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
