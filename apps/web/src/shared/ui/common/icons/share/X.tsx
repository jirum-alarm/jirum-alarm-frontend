import type { SVGProps } from 'react';

// X 공식 로고마크. 브랜드 가이드상 단색만 허용(검정 또는 흰색) — currentColor 로 받는다.
const SvgX = (props: SVGProps<SVGSVGElement>) => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
export default SvgX;
