import type { SVGProps } from 'react';

const SvgArrowLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width ?? 28}
    height={props.height ?? 28}
    viewBox="0 0 28 28"
    fill="none"
    {...props}
  >
    <path
      d="M18 22L10 14L18 6"
      stroke="#101828"
      stroke-width="1.5"
      stroke-linecap="square"
      stroke-linejoin="round"
    />
  </svg>
);
export default SvgArrowLeft;
