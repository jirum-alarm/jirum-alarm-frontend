import React from 'react';
import Svg, {Path, type SvgProps} from 'react-native-svg';

const CaretLeft = (props: SvgProps) => {
  return (
    <Svg
      width={props.width ?? 28}
      height={props.height ?? 28}
      viewBox="0 0 28 28"
      fill="none">
      <Path
        d="M18 22L10 14L18 6"
        stroke="#101828"
        stroke-width="1.5"
        stroke-linecap="square"
        stroke-linejoin="round"
      />
    </Svg>
  );
};

export default CaretLeft;
