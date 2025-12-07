import React from 'react';

interface ComputerOnIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const ComputerOnIcon = ({ width = 64, height = 64, className = '' }: ComputerOnIconProps) => {
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
        fill="#C2DEE4"
      />
      <path d="M24 47.5352H40V53.5352H24V47.5352Z" fill="#C2DEE4" />
      <rect x="20" y="53" width="24" height="5" rx="2.5" fill="#005D91" />
      <path
        d="M4.5 41.9779C4.5 45.5608 7.14295 48.4746 10.3929 48.4746H53.6071C56.8571 48.4746 59.5 45.5608 59.5 41.9779V40.4748H4.5V41.9779Z"
        fill="#005D91"
      />
    </svg>
  );
};

export default ComputerOnIcon;
