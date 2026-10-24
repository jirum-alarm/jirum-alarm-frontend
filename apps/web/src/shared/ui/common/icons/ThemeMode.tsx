import type { SVGProps } from 'react';

/** 화면 모드(반쯤 채운 원) — 마이페이지 「화면 모드」. 앱 ThemeMenuIcon 과 같은 모양, Description 과 같은 28px 틀. */
const SvgThemeMode = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} fill="none" {...props}>
    <circle cx={14} cy={14} r={9} stroke="var(--color-gray-900)" strokeWidth={1.5} />
    <path d="M14 5a9 9 0 0 1 0 18z" fill="var(--color-gray-900)" />
  </svg>
);
export default SvgThemeMode;
