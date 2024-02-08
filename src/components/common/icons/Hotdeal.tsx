import type { SVGProps } from 'react';
const SvgHotdeal = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={36} height={36} fill="none" {...props}>
    <g clipPath="url(#hotdeal_svg__a)">
      <circle cx={18} cy={18} r={18} fill="#F36677" />
      <path
        fill="#fff"
        d="m18 4 2.971 2.911L25 5.876l1.118 4.006L30.124 11l-1.035 4.029L32 18l-2.911 2.971L30.124 25l-4.006 1.118L25 30.124l-4.029-1.035L18 32l-2.971-2.911L11 30.124l-1.118-4.006L5.876 25l1.035-4.029L4 18l2.911-2.971L5.876 11l4.006-1.118L11 5.876l4.029 1.035z"
      />
      <path stroke="#F36677" d="m22.57 13.57-9 9.001" />
      <circle
        cx={15.371}
        cy={15.371}
        r={2.046}
        stroke="#F36677"
        transform="rotate(45 15.37 15.37)"
      />
      <circle cx={20.77} cy={20.77} r={2.046} stroke="#F36677" transform="rotate(45 20.77 20.77)" />
    </g>
    <defs>
      <clipPath id="hotdeal_svg__a">
        <path fill="#fff" d="M0 0h36v36H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default SvgHotdeal;
