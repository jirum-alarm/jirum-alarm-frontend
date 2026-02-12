import type { SVGProps } from 'react';

const SvgShare = (props: SVGProps<SVGSVGElement>) => {
  const { width, height, color, ...others } = props;
  return (
    <svg
      width={width ?? 28}
      height={height ?? 28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke={color ?? '#1D2939'}
      strokeWidth="1.5"
      {...others}
    >
      <circle cx="8.37158" cy="14" r="2.75" />
      <circle cx="19" cy="7.18555" r="2.75" />
      <circle cx="19" cy="20.8145" r="2.75" />
      <path d="M11.062 12.3105L16.2427 8.92383" />
      <path d="M11.2158 15.7461L16.4478 19.1836" />
    </svg>
  );
};
export default SvgShare;
