import type { SVGProps } from 'react';
const SvgSearch = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} fill="none" {...props}>
    <path
      fill={props.color ?? '#fff'}
      d="m22.8 24.007-7.328-7.328a6.7 6.7 0 0 1-2.013 1.13 6.9 6.9 0 0 1-2.353.41q-2.991 0-5.063-2.072-2.072-2.07-2.072-5.062 0-2.989 2.072-5.063 2.07-2.073 5.061-2.073t5.064 2.072 2.072 5.063q0 1.25-.42 2.387a6.7 6.7 0 0 1-1.119 1.979l7.328 7.327zm-11.694-7.539q2.254 0 3.82-1.565t1.565-3.82-1.565-3.819q-1.566-1.565-3.82-1.565-2.255 0-3.82 1.565t-1.565 3.82 1.565 3.82 3.82 1.564"
    />
  </svg>
);
export default SvgSearch;
