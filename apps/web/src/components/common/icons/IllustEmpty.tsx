import type { SVGProps } from 'react';
const SvgIllustEmpty = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={65} height={64} fill="none" {...props}>
    <path
      fill="#E4E7EC"
      d="M54.163 7.947h-44c-3.309 0-6 2.572-6 5.735v28.672h56V13.682c0-3.163-2.69-5.735-6-5.735"
    />
    <path
      fill="#98A2B3"
      d="M4.163 42.8c0 3.163 2.691 5.735 6 5.735h44c3.31 0 6-2.572 6-5.734v-1.327h-56z"
    />
    <path fill="#E4E7EC" d="M24.163 48.535h16v6h-16z" />
    <rect width={24} height={5} x={20.163} y={54} fill="#98A2B3" rx={2.5} />
  </svg>
);
export default SvgIllustEmpty;
