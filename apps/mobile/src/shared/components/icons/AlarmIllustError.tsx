import React from 'react';
import Svg, {Path, type SvgProps} from 'react-native-svg';

/** web AlarmIllustError 와 같은 패스. 알림 목록 빈 상태. */
export default function AlarmIllustError({
  width = 121,
  height = 120,
  ...props
}: SvgProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 121 120"
      fill="none"
      {...props}>
      <Path
        fill="#D0D5DD"
        fillRule="evenodd"
        d="M60.5 15a8 8 0 0 0-8 8v.117C40.374 26.59 31.5 37.76 31.5 51v19.062a8.001 8.001 0 0 0-7 7.938v7h72v-7a8.001 8.001 0 0 0-7-7.938V51c0-13.241-8.874-24.41-21-27.882V23a8 8 0 0 0-8-8"
        clipRule="evenodd"
      />
      <Path
        fill="#667085"
        d="M74.5 91c0 7.732-6.268 14-14 14s-14-6.268-14-14z"
      />
    </Svg>
  );
}
