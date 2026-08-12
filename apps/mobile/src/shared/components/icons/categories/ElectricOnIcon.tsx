import React from 'react';
import Svg, {Circle, Path, Rect} from 'react-native-svg';

interface ElectricOnIconProps {
  width?: number;
  height?: number;
}

const ElectricOnIcon = ({width = 64, height = 64}: ElectricOnIconProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 64 64" fill="none">
      <Rect x="10" y="4" width="44" height="56" rx="2" fill="#DAE5FE" />
      <Circle cx="32" cy="36" r="17" fill="#4873B1" />
      <Circle cx="32" cy="36" r="12" fill="white" />
      <Path
        d="M44 36C44 37.5759 43.6896 39.1363 43.0866 40.5922C42.4835 42.0481 41.5996 43.371 40.4853 44.4853C39.371 45.5996 38.0481 46.4835 36.5922 47.0866C35.1363 47.6896 33.5759 48 32 48C30.4241 48 28.8637 47.6896 27.4078 47.0866C25.9519 46.4835 24.629 45.5996 23.5147 44.4853C22.4004 43.371 21.5165 42.0481 20.9134 40.5922C20.3104 39.1363 20 37.5759 20 36L32 36H44Z"
        fill="#B5CBFD"
      />
      <Rect x="13" y="8" width="17" height="4" rx="2" fill="#0D428E" />
      <Rect x="40" y="8" width="4" height="4" rx="2" fill="#0D428E" />
      <Rect x="46" y="8" width="4" height="4" rx="2" fill="#0D428E" />
    </Svg>
  );
};

export default ElectricOnIcon;
