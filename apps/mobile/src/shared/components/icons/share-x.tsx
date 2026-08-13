import React from 'react';
import Svg, {Path, type SvgProps} from 'react-native-svg';

/** X 공식 로고마크. 검정 원 위에 흰 글리프. */
export default function ShareX({width, height, color, ...props}: SvgProps) {
  return (
    <Svg
      width={width ?? 20}
      height={height ?? 20}
      viewBox="0 0 24 24"
      fill={(color as string) ?? '#fff'}
      {...props}>
      <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </Svg>
  );
}
