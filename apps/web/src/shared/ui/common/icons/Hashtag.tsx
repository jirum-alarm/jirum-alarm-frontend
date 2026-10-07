import type { SVGProps } from 'react';

const SvgHashtag = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={28}
    height={28}
    viewBox="0 0 28 28"
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M11.5 5.5 9.5 22.5M18.5 5.5l-2 17M6.5 10.5h16M5.5 17.5h16"
    />
  </svg>
);
export default SvgHashtag;
