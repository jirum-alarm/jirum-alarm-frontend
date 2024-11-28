import type { SVGProps } from 'react';
const SvgInfo = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" {...props}>
    <path
      stroke="#98A2B3"
      strokeLinecap="square"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10 13.2V10m0-3.2h.008M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
    />
  </svg>
);
export default SvgInfo;
