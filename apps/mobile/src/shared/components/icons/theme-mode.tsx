import React from 'react';
import Svg, {Circle, Path, type SvgProps} from 'react-native-svg';

/** 화면 모드 스위치 손잡이 안에 들어가는 작은 아이콘이라 채운 모양·굵은 선으로 그린다(14px 에서도 읽히게). */
export const MoonIcon = ({color, width, height, ...props}: SvgProps) => (
  <Svg
    width={width ?? 14}
    height={height ?? 14}
    viewBox="0 0 24 24"
    fill="none"
    {...props}>
    <Path
      d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1Z"
      fill={color as string}
    />
  </Svg>
);

export const SunIcon = ({color, width, height, ...props}: SvgProps) => (
  <Svg
    width={width ?? 14}
    height={height ?? 14}
    viewBox="0 0 24 24"
    fill="none"
    {...props}>
    <Circle cx={12} cy={12} r={4.5} fill={color as string} />
    <Path
      d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
      stroke={color as string}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);
