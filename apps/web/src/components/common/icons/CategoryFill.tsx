import type { SVGProps } from 'react';
const SvgCategoryFill = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} fill="none" {...props}>
    <rect
      width={6.5}
      height={6.5}
      x={5.75}
      y={5.75}
      fill="#9EF22E"
      stroke="#101828"
      strokeWidth={1.5}
      rx={1.25}
    />
    <rect
      width={6.5}
      height={6.5}
      x={5.75}
      y={15.75}
      fill="#9EF22E"
      stroke="#101828"
      strokeWidth={1.5}
      rx={1.25}
    />
    <rect
      width={6.5}
      height={6.5}
      x={15.75}
      y={5.75}
      fill="#9EF22E"
      stroke="#101828"
      strokeWidth={1.5}
      rx={1.25}
    />
    <rect
      width={6.5}
      height={6.5}
      x={15.75}
      y={15.75}
      fill="#9EF22E"
      stroke="#101828"
      strokeWidth={1.5}
      rx={1.25}
    />
  </svg>
);
export default SvgCategoryFill;
