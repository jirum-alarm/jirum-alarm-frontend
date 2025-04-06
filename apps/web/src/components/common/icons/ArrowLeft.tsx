import type { SVGProps } from 'react';

const SvgArrowLeft = (props: SVGProps<SVGSVGElement>) => {
  const { width, height, color, ...others } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width ?? 28}
      height={height ?? 28}
      viewBox="0 0 28 28"
      fill="none"
      {...props}
    >
      <path
        d="M18 22L10 14L18 6"
        stroke={color ?? '#1D2939'}
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default SvgArrowLeft;
