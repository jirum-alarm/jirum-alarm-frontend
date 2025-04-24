import React from 'react';

interface ComputerOffIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const ComputerOffIcon = ({ width = 64, height = 64, className = '' }: ComputerOffIconProps) => {
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
        d="M53.6071 8.47461H10.3929C7.14295 8.47461 4.5 10.8666 4.5 13.8079V40.4746H59.5V13.8079C59.5 10.8666 56.8571 8.47461 53.6071 8.47461Z"
        fill="#E4E7EC"
      />
      <path
        d="M4.5 41.8015C4.5 44.9641 7.14295 47.536 10.3929 47.536H53.6071C56.8571 47.536 59.5 44.9641 59.5 41.8015V40.4747H4.5V41.8015Z"
        fill="#98A2B3"
      />
      <path d="M24 47.5352H40V53.5352H24V47.5352Z" fill="#E4E7EC" />
      <rect x="20" y="53" width="24" height="5" rx="2.5" fill="#98A2B3" />
    </svg>
  );
};

export default ComputerOffIcon;
