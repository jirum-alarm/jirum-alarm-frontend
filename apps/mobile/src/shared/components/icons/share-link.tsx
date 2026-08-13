import React from 'react';
import Svg, {Path, type SvgProps} from 'react-native-svg';

/** 링크 복사용 체인 아이콘. */
export default function ShareLink({width, height, color, ...props}: SvgProps) {
  const stroke = (color as string) ?? '#4B5563';
  return (
    <Svg
      width={width ?? 20}
      height={height ?? 20}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <Path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <Path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Svg>
  );
}
