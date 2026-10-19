import type { SVGProps } from 'react';

/** 하단 탭 「키워드」 — 둥근 칸 안의 #. 앱 탭 아이콘(apps/mobile tab-icons/keyword@3x.png)과 같은 모양. */
const SvgKeyword = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} fill="none" {...props}>
    <rect
      x={4.75}
      y={4.75}
      width={18.5}
      height={18.5}
      rx={5}
      stroke="currentColor"
      strokeWidth={1.5}
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M12.4 9.25 11.1 18.75M16.9 9.25 15.6 18.75M9.25 12h9.5M9.25 16h9.5"
    />
  </svg>
);
export default SvgKeyword;
