import React from 'react';

interface LeisureOffIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const LeisureOffIcon = ({ width = 64, height = 64, className = '' }: LeisureOffIconProps) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M43 14V19.9311C43 20.2151 42.8419 20.4861 42.5604 20.6867C42.2788 20.8874 41.8985 21 41.5 21C41.1015 21 40.7212 20.8874 40.4396 20.6867C40.1581 20.4861 40 20.2139 40 19.9311V14"
        fill="#98A2B3"
      />
      <path
        d="M40.2675 52.8503H2L20.0713 18.7185L21.1343 16.709L22.1974 18.7185L40.2675 52.8503Z"
        fill="#D0D5DD"
      />
      <path d="M61.5273 52.8503H40.2679L21.1348 16.709H41.862L61.5273 52.8503Z" fill="#E4E7EC" />
      <path d="M23 14V46H20V14" fill="#98A2B3" />
      <path
        d="M30.9328 52.8525H11.3398L20.5914 35.3142L21.1363 34.2812L21.6801 35.3142L30.9328 52.8525Z"
        fill="#98A2B3"
      />
    </svg>
  );
};

export default LeisureOffIcon;
