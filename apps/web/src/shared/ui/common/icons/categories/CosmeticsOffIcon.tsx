import React from 'react';

interface CosmeticsOffIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const CosmeticsOffIcon = ({ width = 64, height = 64, className = '' }: CosmeticsOffIconProps) => {
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
        d="M51.0833 31H11.9167C9.75355 31 8 32.7909 8 35V51C8 53.2091 9.75355 55 11.9167 55H51.0833C53.2464 55 55 53.2091 55 51V35C55 32.7909 53.2464 31 51.0833 31Z"
        fill="#E4E7EC"
      />
      <path
        d="M13.95 23H49.05C49.5672 23 50.0632 23.2107 50.4289 23.5858C50.7946 23.9609 51 24.4696 51 25V31H12V25C12 24.4696 12.2054 23.9609 12.5711 23.5858C12.9368 23.2107 13.4328 23 13.95 23Z"
        fill="#98A2B3"
      />
      <path
        d="M46.9688 23C46.9688 23 47.4217 18.4604 44.8746 14.7456C43.0803 12.1252 41.1486 9.98225 37.4169 8.19476C37.1493 8.06329 36.8561 7.99671 36.5597 8.00013C36.2634 8.00354 35.9717 8.07687 35.707 8.21449C35.4423 8.3521 35.2117 8.55036 35.0326 8.7941C34.8536 9.03784 34.731 9.32061 34.6742 9.62076C34.3161 11.572 32.7096 13.8968 27.0675 13.8289C19.7879 13.743 16 17.0084 16 23H46.9688Z"
        fill="#D0D5DD"
      />
      <rect x="23" y="40" width="18" height="6" rx="3" fill="white" />
    </svg>
  );
};

export default CosmeticsOffIcon;
