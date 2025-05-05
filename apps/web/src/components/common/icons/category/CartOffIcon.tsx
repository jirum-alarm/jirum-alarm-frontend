import React from 'react';

interface CartOffIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const CartOffIcon = ({ width = 64, height = 64, className = '' }: CartOffIconProps) => {
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
        d="M61.5765 15.77C61.3897 15.5302 61.1506 15.3362 60.8775 15.2028C60.6044 15.0694 60.3045 15 60.0005 15H14.0625L21.0625 45H54.0005C54.4465 44.9999 54.8797 44.8508 55.2312 44.5763C55.5827 44.3018 55.8323 43.9177 55.9405 43.485L61.9405 17.485C62.0905 16.888 61.9565 16.255 61.5765 15.77Z"
        fill="#E4E7EC"
      />
      <circle cx="30" cy="56" r="6" fill="#98A2B3" />
      <circle cx="30" cy="56" r="2.5" fill="white" />
      <circle cx="46" cy="56" r="6" fill="#98A2B3" />
      <circle cx="46" cy="56" r="2.5" fill="white" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 11C0 9.89543 0.89543 9 2 9H11.5C12.4135 9 13.2109 9.61891 13.4375 10.5038L23.5523 50H52C53.1046 50 54 50.8954 54 52C54 53.1046 53.1046 54 52 54H22C21.0865 54 20.2891 53.3811 20.0625 52.4962L9.94765 13H2C0.89543 13 0 12.1046 0 11Z"
        fill="#D0D5DD"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 25C14 23.8954 14.8954 23 16 23L56 23C57.1046 23 58 23.8954 58 25C58 26.1046 57.1046 27 56 27L16 27C14.8954 27 14 26.1046 14 25Z"
        fill="#D0D5DD"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 35C16 33.8954 16.8954 33 18 33L54 33C55.1046 33 56 33.8954 56 35C56 36.1046 55.1046 37 54 37L18 37C16.8954 37 16 36.1046 16 35Z"
        fill="#D0D5DD"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27.6576 17.0299C28.7459 16.8406 29.7815 17.5694 29.9708 18.6576L33.9708 41.6576C34.16 42.7459 33.4312 43.7815 32.343 43.9708C31.2548 44.16 30.2192 43.4312 30.0299 42.343L26.0299 19.343C25.8406 18.2548 26.5694 17.2192 27.6576 17.0299Z"
        fill="#D0D5DD"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M48.3424 17.0299C47.2541 16.8406 46.2185 17.5694 46.0292 18.6576L42.0292 41.6576C41.84 42.7459 42.5688 43.7815 43.657 43.9708C44.7452 44.16 45.7808 43.4312 45.9701 42.343L49.9701 19.343C50.1594 18.2548 49.4306 17.2192 48.3424 17.0299Z"
        fill="#D0D5DD"
      />
    </svg>
  );
};

export default CartOffIcon;
