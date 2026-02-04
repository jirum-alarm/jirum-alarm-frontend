import type { SVGProps } from 'react';

const SvgFilter = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} fill="none" {...props}>
    <path
      fill="#101828"
      fillRule="evenodd"
      d="M10.823 11.374a1.282 1.282 0 1 0 0-2.564 1.282 1.282 0 0 0 0 2.563m0 1.5c1.277 0 2.352-.86 2.68-2.032H22.5v-1.5h-8.997a2.783 2.783 0 0 0-5.36 0H5.5v1.5h2.643a2.783 2.783 0 0 0 2.68 2.031m9.391 5.784a2.783 2.783 0 0 1-5.36 0H5.5v-1.5h9.355a2.783 2.783 0 0 1 5.36 0H22.5v1.5zm-1.398-.75a1.282 1.282 0 1 1-2.564 0 1.282 1.282 0 0 1 2.564 0"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgFilter;
