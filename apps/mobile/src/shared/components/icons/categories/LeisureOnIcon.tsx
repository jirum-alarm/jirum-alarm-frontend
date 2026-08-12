import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface LeisureOnIconProps {
  width?: number;
  height?: number;
}

const LeisureOnIcon = ({width = 64, height = 64}: LeisureOnIconProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 64 64" fill="none">
      <Path
        d="M43 14V19.9311C43 20.2151 42.8419 20.4861 42.5604 20.6867C42.2788 20.8874 41.8985 21 41.5 21C41.1015 21 40.7212 20.8874 40.4396 20.6867C40.1581 20.4861 40 20.2139 40 19.9311V14"
        fill="#260091"
      />
      <Path
        d="M40.2675 52.8503H2L20.0713 18.7185L21.1343 16.709L22.1974 18.7185L40.2675 52.8503Z"
        fill="#9D9BFF"
      />
      <Path
        d="M61.5273 52.8503H40.2679L21.1348 16.709H41.862L61.5273 52.8503Z"
        fill="#C5C0FA"
      />
      <Path d="M23 14V46H20V14" fill="#260091" />
      <Path
        d="M30.9328 52.8525H11.3398L20.5914 35.3142L21.1363 34.2812L21.6801 35.3142L30.9328 52.8525Z"
        fill="#551BD1"
      />
    </Svg>
  );
};

export default LeisureOnIcon;
