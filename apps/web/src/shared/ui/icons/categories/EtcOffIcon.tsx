import React from 'react';

interface EtcOffIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const EtcOffIcon = ({ width = 64, height = 64, className = '' }: EtcOffIconProps) => {
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
        d="M52.56 55H11.44C9.56 55 8 53.495 8 51.5941V19H56V51.5941C56 53.495 54.48 55 52.56 55Z"
        fill="#E4E7EC"
      />
      <path
        d="M4 12C4 10.8954 4.89543 10 6 10H58C59.1046 10 60 10.8954 60 12V19H4V12Z"
        fill="#D0D5DD"
      />
      <path
        d="M18 27C18 25.8954 18.8954 25 20 25H44C45.1046 25 46 25.8954 46 27V46C46 47.1046 45.1046 48 44 48H20C18.8954 48 18 47.1046 18 46V27Z"
        fill="white"
      />
      <path
        d="M22 30.5C22 29.6716 22.6716 29 23.5 29H40.5C41.3284 29 42 29.6716 42 30.5C42 31.3284 41.3284 32 40.5 32H23.5C22.6716 32 22 31.3284 22 30.5Z"
        fill="#98A2B3"
      />
      <path
        d="M22 36.5C22 35.6716 22.6716 35 23.5 35H40.5C41.3284 35 42 35.6716 42 36.5C42 37.3284 41.3284 38 40.5 38H23.5C22.6716 38 22 37.3284 22 36.5Z"
        fill="#98A2B3"
      />
      <path
        d="M22 42.5C22 41.6716 22.6716 41 23.5 41H40.5C41.3284 41 42 41.6716 42 42.5C42 43.3284 41.3284 44 40.5 44H23.5C22.6716 44 22 43.3284 22 42.5Z"
        fill="#98A2B3"
      />
    </svg>
  );
};

export default EtcOffIcon;
