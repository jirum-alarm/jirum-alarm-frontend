import React from 'react';
import Svg, {Ellipse, Path} from 'react-native-svg';

interface PetOnIconProps {
  width?: number;
  height?: number;
}

const PetOnIcon = ({width = 64, height = 64}: PetOnIconProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 64 64" fill="none">
      <Path
        d="M32 33C38 33 42.5 37.5 46 43C49.5 48.5 47.5 56 40.5 56C36.5 56 35 54 32 54C29 54 27.5 56 23.5 56C16.5 56 14.5 48.5 18 43C21.5 37.5 26 33 32 33Z"
        fill="#F7B98B"
      />
      <Ellipse
        cx="15"
        cy="30"
        rx="6"
        ry="8"
        transform="rotate(-20 15 30)"
        fill="#EA8C00"
      />
      <Ellipse
        cx="25"
        cy="18"
        rx="6.5"
        ry="8.5"
        transform="rotate(-8 25 18)"
        fill="#EA8C00"
      />
      <Ellipse
        cx="39"
        cy="18"
        rx="6.5"
        ry="8.5"
        transform="rotate(8 39 18)"
        fill="#EA8C00"
      />
      <Ellipse
        cx="49"
        cy="30"
        rx="6"
        ry="8"
        transform="rotate(20 49 30)"
        fill="#EA8C00"
      />
    </Svg>
  );
};

export default PetOnIcon;
