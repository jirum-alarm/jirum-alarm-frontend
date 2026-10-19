import type { SVGProps } from 'react';

const SvgKeywordFill = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} fill="none" {...props}>
    <rect
      x={4.75}
      y={4.75}
      width={18.5}
      height={18.5}
      rx={5}
      fill="#9EF22E"
      stroke="var(--color-gray-900)"
      strokeWidth={1.5}
    />
    <path
      stroke="var(--color-gray-900)"
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M12.4 9.25 11.1 18.75M16.9 9.25 15.6 18.75M9.25 12h9.5M9.25 16h9.5"
    />
  </svg>
);
export default SvgKeywordFill;
