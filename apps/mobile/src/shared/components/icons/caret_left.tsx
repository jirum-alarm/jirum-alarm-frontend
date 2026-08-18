import React from 'react';
import Svg, {Path, type SvgProps} from 'react-native-svg';

/** 검색·공유 아이콘과 같은 규격(viewBox 28 · stroke 1.5). */
const CaretLeft = ({color, width, height, ...props}: SvgProps) => (
  <Svg
    width={width ?? 28}
    height={height ?? 28}
    viewBox="0 0 28 28"
    fill="none"
    {...props}>
    <Path
      d="M18 22L10 14L18 6"
      stroke={(color as string) ?? '#1D2939'}
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="round"
    />
  </Svg>
);

export default CaretLeft;
