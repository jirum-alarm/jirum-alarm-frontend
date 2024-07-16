import type { SVGProps } from 'react';
const SvgAlert = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={29} height={28} fill="none" {...props}>
    <path
      stroke="#101828"
      strokeLinecap="square"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M11.853 23c.705.622 1.632 1 2.646 1s1.94-.378 2.646-1m3.354-13a6 6 0 1 0-12 0c0 3.09-.78 5.206-1.65 6.605-.735 1.18-1.102 1.771-1.089 1.936.015.182.054.252.2.36.133.099.732.099 1.928.099H21.11c1.197 0 1.795 0 1.927-.098.147-.11.186-.179.2-.361.014-.165-.353-.755-1.088-1.936-.87-1.399-1.65-3.515-1.65-6.605Z"
    />
  </svg>
);
export default SvgAlert;
