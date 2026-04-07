import type { SVGProps } from 'react';

const XSmall = (props: SVGProps<SVGSVGElement>) => {
  const { width, height, ...others } = props;
  return (
    <svg
      width={width ?? 20}
      height={height ?? 20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...others}
    >
      <path
        d="M15.7143 4.28577L4.28571 15.7143M4.28571 4.28577L15.7143 15.7143"
        stroke="#667085"
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default XSmall;
