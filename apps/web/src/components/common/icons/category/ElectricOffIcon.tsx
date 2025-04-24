import React from 'react';

interface ElectricOffIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const ElectricOffIcon = ({ width = 64, height = 64, className = '' }: ElectricOffIconProps) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="10" y="4" width="44" height="56" rx="2" fill="#E4E7EC" />
      <circle cx="32" cy="36" r="17" fill="#98A2B3" />
      <circle cx="32" cy="36" r="12" fill="white" />
      <path
        d="M44 36C44 37.5759 43.6896 39.1363 43.0866 40.5922C42.4835 42.0481 41.5996 43.371 40.4853 44.4853C39.371 45.5996 38.0481 46.4835 36.5922 47.0866C35.1363 47.6896 33.5759 48 32 48C30.4241 48 28.8637 47.6896 27.4078 47.0866C25.9519 46.4835 24.629 45.5996 23.5147 44.4853C22.4004 43.371 21.5165 42.0481 20.9134 40.5922C20.3104 39.1363 20 37.5759 20 36L32 36H44Z"
        fill="#E4E7EC"
      />
      <rect x="13" y="8" width="17" height="4" rx="2" fill="#98A2B3" />
      <rect x="40" y="8" width="4" height="4" rx="2" fill="#98A2B3" />
      <rect x="46" y="8" width="4" height="4" rx="2" fill="#98A2B3" />
    </svg>
  );
};

export default ElectricOffIcon;
