import React from 'react';

interface IllustProps {
  width?: number;
  height?: number;
  className?: string;
}

const Illust: React.FC<IllustProps> = ({ width = 220, height = 220, className }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M72.4863 32.0508C87.7301 32.0508 100.088 44.4086 100.088 59.6523C100.088 74.896 87.73 87.2529 72.4863 87.2529C57.2427 87.2529 44.8849 74.896 44.8848 59.6523C44.8848 44.4086 57.2426 32.0509 72.4863 32.0508Z"
        fill="url(#paint0_linear_1797_48745)"
      />
      <path
        d="M75.0552 54.1208C74.8057 54.9841 75.4535 55.8457 76.3521 55.8457H83.995C85.1202 55.8457 85.7516 57.1415 85.0582 58.0276L68.6751 78.9646C67.76 80.134 65.9026 79.1842 66.315 77.7577L69.9495 65.1859C70.1991 64.3225 69.5513 63.4609 68.6526 63.4609H61.0097C59.8845 63.4609 59.2531 62.1652 59.9465 61.279L76.3296 40.342C77.2447 39.1726 79.1021 40.1224 78.6897 41.5489L75.0552 54.1208Z"
        fill="url(#paint1_linear_1797_48745)"
      />
      <g filter="url(#filter0_i_1797_48745)">
        <path
          d="M136.557 27.1152C145.548 35.1573 151.227 52.763 148.913 66.9609C146.138 83.9877 139.926 84.3781 139.778 91.3516C139.779 91.6755 139.787 92.0145 139.805 92.3711C140.299 102.15 154.429 103.292 156.413 94.3643C157.05 91.4992 156.855 88.543 156.381 85.8623C167.16 97.2827 173.77 112.682 173.77 129.626C173.769 164.845 145.218 193.396 109.999 193.396C74.7797 193.396 46.2286 164.845 46.2285 129.626C46.2285 115.495 50.8254 102.438 58.6045 91.8672C58.5841 92.3114 58.5732 92.7547 58.5732 93.1943C58.5733 98.8606 60.1562 102.552 63.1641 103.722C66.1721 104.891 69.7575 101.834 70.8662 96.6992C71.9749 91.5643 74.9422 83.7331 83.0166 76.3867C83.3672 76.0678 83.7186 75.7617 84.0684 75.4648C97.8968 63.3437 111.476 65.3014 125.51 52.9688C137.685 42.2696 136.557 27.1152 136.557 27.1152Z"
          fill="#60FF4B"
        />
      </g>
      <path
        d="M94.8703 135.254C91.5303 135.254 88.8227 132.546 88.8227 129.206C88.8227 125.866 91.5303 123.158 94.8703 123.158C98.2103 123.158 100.918 125.866 100.918 129.206C100.918 132.546 98.2103 135.254 94.8703 135.254Z"
        fill="#162034"
      />
      <path
        d="M125.112 135.254C121.772 135.254 119.065 132.546 119.065 129.206C119.065 125.866 121.772 123.158 125.112 123.158C128.453 123.158 131.16 125.866 131.16 129.206C131.16 132.546 128.453 135.254 125.112 135.254Z"
        fill="#162034"
      />
      <path
        d="M102.131 153.502L99.082 151.742L102.106 146.504L105.155 148.265C110.096 151.117 116.415 149.425 119.268 144.484L121.029 141.434L126.267 144.458L124.506 147.508C119.983 155.342 109.965 158.025 102.131 153.502Z"
        fill="#162034"
      />
      <defs>
        <filter
          id="filter0_i_1797_48745"
          x="46.2285"
          y="21.1152"
          width="133.541"
          height="172.281"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="6" dy="-6" />
          <feGaussianBlur stdDeviation="8" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0.54902 0 0 0 0 0.466667 0 0 0 0.4 0"
          />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1797_48745" />
        </filter>
        <linearGradient
          id="paint0_linear_1797_48745"
          x1="100.088"
          y1="32.0508"
          x2="44.8857"
          y2="87.2539"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#21F0FF" />
          <stop offset="0.495192" stopColor="#009BB2" />
          <stop offset="1" stopColor="#21F0FF" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1797_48745"
          x1="104.646"
          y1="63.3716"
          x2="75.8108"
          y2="92.908"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0.6" />
          <stop offset="0.470389" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Illust;
