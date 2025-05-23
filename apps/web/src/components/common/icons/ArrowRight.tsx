import type { SVGProps } from 'react';

const SvgArrowRight = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width ?? 24}
    height={props.height ?? 25}
    viewBox="0 0 24 25"
    fill="none"
    {...props}
  >
    <path
      d="M14.62 12.51 7.561 5.433l.91-.91 7.966 7.987-7.967 7.967-.91-.91z"
      strokeWidth={props.strokeWidth ?? 1.5}
      stroke={props.color ?? '#475467'}
    />
  </svg>
);
export default SvgArrowRight;
