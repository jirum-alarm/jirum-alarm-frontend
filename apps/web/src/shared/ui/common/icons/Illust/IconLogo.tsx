import React from 'react';

interface IconLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const IconLogo: React.FC<IconLogoProps> = ({ width = 32, height = 32, className }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g filter="url(#filter0_i_1799_53520)">
        <path
          d="M20.5073 0.914062C22.0331 2.27877 22.9966 5.26644 22.604 7.67578C22.1218 10.6348 21.03 10.6329 21.0562 11.9023C21.0569 11.9297 21.0567 11.9577 21.0581 11.9863C21.1419 13.6459 23.5398 13.8394 23.8765 12.3242C23.9844 11.8382 23.9482 11.3376 23.8677 10.8828C25.6975 12.8209 26.8218 15.4328 26.8218 18.3086C26.8216 24.2849 21.9768 29.1297 16.0005 29.1299C10.024 29.1298 5.17843 24.285 5.17822 18.3086C5.17823 15.911 5.959 13.6961 7.27881 11.9023C7.27539 11.9771 7.27393 12.0519 7.27393 12.126C7.27397 13.0872 7.54207 13.7135 8.05225 13.9121C8.56269 14.1106 9.17171 13.592 9.35986 12.7207C9.548 11.8493 10.0512 10.5201 11.4214 9.27344C11.5187 9.18488 11.6164 9.10212 11.7134 9.02344C14.0212 7.07315 16.289 7.3608 18.6323 5.30176C20.6984 3.48615 20.5073 0.914062 20.5073 0.914062Z"
          fill="#60FF4B"
        />
      </g>
      <path
        d="M12.7746 19.8464C12.0619 19.8464 11.4842 19.2687 11.4842 18.556C11.4842 17.8433 12.0619 17.2656 12.7746 17.2656C13.4872 17.2656 14.0649 17.8433 14.0649 18.556C14.0649 19.2687 13.4872 19.8464 12.7746 19.8464Z"
        fill="#162034"
      />
      <path
        d="M19.2257 19.8464C18.5131 19.8464 17.9354 19.2687 17.9354 18.556C17.9354 17.8433 18.5131 17.2656 19.2257 17.2656C19.9384 17.2656 20.5161 17.8433 20.5161 18.556C20.5161 19.2687 19.9384 19.8464 19.2257 19.8464Z"
        fill="#162034"
      />
      <path
        d="M14.0758 23.899L13.4253 23.5234L14.0705 22.4059L14.721 22.7814C15.7753 23.3901 17.1236 23.029 17.7324 21.9747L18.1081 21.324L19.2257 21.9692L18.85 22.6199C17.8849 24.2914 15.7473 24.8641 14.0758 23.899Z"
        fill="#162034"
      />
      <defs>
        <filter
          id="filter0_i_1799_53520"
          x="5.17822"
          y="-0.0859375"
          width="22.6436"
          height="29.2148"
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
          <feOffset dx="1" dy="-1" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0.54902 0 0 0 0 0.466667 0 0 0 0.6 0"
          />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_1799_53520" />
        </filter>
      </defs>
    </svg>
  );
};

export default IconLogo;
