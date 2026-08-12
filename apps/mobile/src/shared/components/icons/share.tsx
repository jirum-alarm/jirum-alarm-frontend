import React from 'react';
import Svg, {Circle, Path, type SvgProps} from 'react-native-svg';

/** web shared/ui/common/icons/Share.tsx 와 같은 마크(연결된 원 3개). */
const Share = ({color, width, height, ...props}: SvgProps) => (
  <Svg
    width={width ?? 28}
    height={height ?? 28}
    viewBox="0 0 28 28"
    fill="none"
    stroke={(color as string) ?? '#1D2939'}
    strokeWidth={1.5}
    {...props}>
    <Circle cx="8.37158" cy="14" r="2.75" />
    <Circle cx="19" cy="7.18555" r="2.75" />
    <Circle cx="19" cy="20.8145" r="2.75" />
    <Path d="M11.062 12.3105L16.2427 8.92383" />
    <Path d="M11.2158 15.7461L16.4478 19.1836" />
  </Svg>
);

export default Share;
