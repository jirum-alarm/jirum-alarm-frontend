import React from 'react';

interface BookOnIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const BookOnIcon = ({ width = 64, height = 64, className = '' }: BookOnIconProps) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_3_816)">
        <path
          d="M4 22C4 19.2386 6.23858 17 9 17H55C57.7614 17 60 19.2386 60 22V50C60 52.7614 57.7614 55 55 55H9C6.23858 55 4 52.7614 4 50V22Z"
          fill="#910900"
        />
        <path
          d="M19.5 12C12.5556 12 7 13.79 7 16V47H32V16C32 13.79 26.4444 12 19.5 12Z"
          fill="#FFF8ED"
        />
        <path
          d="M19.5 43C12.5556 43 7 44.79 7 47V48C7 49.0609 7.39021 50.0783 8.08479 50.8284C8.77937 51.5786 9.72142 52 10.7037 52H32V47C32 44.79 26.4444 43 19.5 43Z"
          fill="#F5CCB5"
        />
        <path
          d="M27 35.9797C24.7102 35.4833 22.3822 35.2416 20.0499 35.2583C17.6837 35.2398 15.3218 35.4883 13 36M27 27.851C24.7102 27.3546 22.3822 27.113 20.0499 27.1296C17.6837 27.1112 15.3218 27.3597 13 27.8713M27 19.7224C24.7102 19.226 22.3822 18.9843 20.0499 19.001C17.6837 18.9825 15.3218 19.231 13 19.7427"
          stroke="#910900"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M44.5 12C51.4444 12 57 13.79 57 16V47H32V16C32 13.79 37.5556 12 44.5 12Z"
          fill="#FFF8ED"
        />
        <path
          d="M44.5 43C51.4444 43 57 44.79 57 47V48C57 49.0609 56.6098 50.0783 55.9152 50.8284C55.2206 51.5786 54.2786 52 53.2963 52H32V47C32 44.79 37.5556 43 44.5 43Z"
          fill="#F5CCB5"
        />
        <path
          d="M52 35.9797C49.5466 35.4833 47.0523 35.2416 44.5535 35.2583C42.0182 35.2398 39.4876 35.4883 37 36M52 27.851C49.5466 27.3546 47.0523 27.113 44.5535 27.1296C42.0182 27.1112 39.4876 27.3597 37 27.8713M52 19.7224C49.5466 19.226 47.0523 18.9843 44.5535 19.001C42.0182 18.9825 39.4876 19.231 37 19.7427"
          stroke="#910900"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_3_816">
          <rect width="64" height="64" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default BookOnIcon;
