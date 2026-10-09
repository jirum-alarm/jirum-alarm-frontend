import React from 'react';
import Svg, {Path, type SvgProps} from 'react-native-svg';

/**
 * 체크 표시. ✓ 글리프 대신 쓴다 — 글꼴에 U+2713 이 없으면 두부가 된다.
 * 색은 놓이는 면(파랑·초록 동그라미, 체크박스)마다 달라 기본값이 없다.
 */
export default function Check({
  width = 16,
  height = 16,
  color,
  strokeWidth = 2.4,
  ...props
}: SvgProps & {color: string; strokeWidth?: number}) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      {...props}>
      <Path
        d="M4 10.5l4 4 8-8.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
