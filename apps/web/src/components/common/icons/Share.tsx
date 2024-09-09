import type { SVGProps } from 'react';

const SvgShare = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} fill="none" {...props}>
    <path
      stroke="#101828"
      strokeLinecap="square"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M22.5 14v3.967c0 1.587 0 2.38-.309 2.986a2.83 2.83 0 0 1-1.238 1.238c-.606.309-1.4.309-2.986.309h-7.934c-1.586 0-2.38 0-2.986-.309a2.83 2.83 0 0 1-1.238-1.238c-.309-.606-.309-1.4-.309-2.986V14m12.278-4.722L14 5.5m0 0-3.778 3.778M14 5.5v11.333"
    />
  </svg>
);
export default SvgShare;
